# Lược đồ Tuần tự Nghiệp vụ Chat (Chat & Chatbot Sequence Diagram) - PTIT BookLand

Tài liệu này chứa các lược đồ tuần tự (Sequence Diagram) mô tả quy trình hội thoại bao gồm: **Trò chuyện với Trợ lý AI (BookBot)** và **Hỗ trợ trực tuyến với Nhân viên hỗ trợ (Support Staff Chat)** của hệ thống **PTIT BookLand** bằng cú pháp **Mermaid**.

---

## 1. Trò chuyện với Trợ lý AI (BookBot Chatbot)
*Quy trình xử lý tin nhắn của khách hàng, tích hợp cơ sở tri thức để tạo ngữ cảnh và sử dụng Gemini API sinh phản hồi, tự động gợi ý sản phẩm hoặc yêu cầu gặp nhân viên hỗ trợ nếu độ tin cậy thấp.*

```mermaid
sequenceDiagram
    autonumber
    actor Client as FE Client (User)
    participant Ctrl as ChatbotController
    participant Svc as ChatbotService
    participant SessionRepo as ChatbotSessionRepository
    participant MsgRepo as ChatMessageRepository
    participant Gemini as GeminiService
    participant BookRepo as BookRepository
    participant WSTemplate as SimpMessagingTemplate

    %% --- Session Initialization ---
    Note over Client, Ctrl: Khởi tạo/Khôi phục phiên làm việc (Session)
    Client->>Ctrl: POST /api/chatbot/session (CreateChatbotSessionRequest)
    activate Ctrl
    Ctrl->>Svc: createOrResumeSession(request, userId)
    activate Svc
    
    alt Chưa có Session Active
        Svc->>SessionRepo: save(ChatbotSession - status: ACTIVE)
        activate SessionRepo
        SessionRepo-->>Svc: session
        deactivate SessionRepo
        
        Svc->>Svc: buildWelcomeMessage(user)
        Svc->>MsgRepo: save(Welcome message - role: ASSISTANT, type: QUICK_REPLY)
        activate MsgRepo
        MsgRepo-->>Svc: welcomeMsg
        deactivate MsgRepo
    else Đã có Session Active
        Svc->>SessionRepo: Lấy Session cũ từ DB
    end

    Svc-->>Ctrl: ChatbotSessionResponse
    deactivate Svc
    Ctrl-->>Client: 200 OK (Session Info & Welcome Message)
    deactivate Ctrl

    %% --- Message Processing ---
    Note over Client, Ctrl: Xử lý gửi tin nhắn hỏi đáp
    Client->>Ctrl: POST /api/chatbot/message/{sessionId} (SendChatbotMessageRequest)
    activate Ctrl
    Ctrl->>Svc: processMessage(sessionId, request, userId, guestToken)
    activate Svc

    %% 1. Save User Message
    Svc->>MsgRepo: save(ChatMessage - content, role: USER, type: TEXT)
    activate MsgRepo
    MsgRepo-->>Svc: userMsg
    deactivate MsgRepo

    %% 2. Build Context and call Gemini
    Svc->>Svc: buildChatHistory(sessionId) (Lấy 20 tin nhắn gần nhất)
    Svc->>Gemini: buildContext(userContent, history)
    activate Gemini
    Gemini-->>Svc: context (Thông tin từ Knowledge Base + Sách)
    deactivate Gemini

    Svc->>Gemini: generateResponse(userContent, context)
    activate Gemini
    Gemini-->>Svc: GeminiResult (message, confidence, suggestedBookIds, quickReplies)
    deactivate Gemini

    %% 3. Evaluate Results & Book Suggestions
    alt Có gợi ý sách (suggestedBookIds)
        Svc->>BookRepo: findAllById(suggestedBookIds)
        activate BookRepo
        BookRepo-->>Svc: List~Book~ (Thông tin sách còn hàng)
        deactivate BookRepo
        Svc->>Svc: set contentType = PRODUCT_CARD, buildMetadata()
    else Có Quick Replies
        Svc->>Svc: set contentType = QUICK_REPLY, buildMetadata()
    else Tin nhắn văn bản thông thường
        Svc->>Svc: set contentType = TEXT
    end

    %% 4. Save Bot Message & Update Session
    Svc->>MsgRepo: save(ChatMessage - content, role: ASSISTANT, confidence)
    activate MsgRepo
    MsgRepo-->>Svc: botMsg
    deactivate MsgRepo

    Svc->>Svc: Cập nhật lastActivity, messageCount += 2
    Svc->>SessionRepo: save(session)

    %% 5. Send Live Response via WebSocket
    Svc->>WSTemplate: convertAndSendToUser(userEmail, "/queue/chatbot", response)

    Svc-->>Ctrl: ChatbotMessageResponse (botResponse, suggestEscalation)
    deactivate Svc
    Ctrl-->>Client: 200 OK (ApiResponse~ChatbotMessageResponse~)
    deactivate Ctrl
```

---

## 2. Hỗ trợ trực tuyến với Nhân viên hỗ trợ (Support Staff Chat)
*Quy trình trò chuyện trực tiếp (Live Chat) thời gian thực giữa Khách hàng và Nhân viên hỗ trợ qua giao thức HTTP REST kết hợp WebSocket.*

```mermaid
sequenceDiagram
    autonumber
    actor Customer as FE Client (Customer)
    actor Supporter as FE Client (Supporter)
    participant Ctrl as ChatMessageController
    participant Svc as ChatMessageService
    participant MsgRepo as ChatMessageRepository
    participant WSTemplate as SimpMessagingTemplate

    %% --- Customer sends message ---
    Note over Customer, Supporter: Khách hàng gửi tin nhắn cho Nhân viên
    Customer->>Ctrl: POST /chat/send (SendChatMessageRequest - toUserId: SupporterID)
    activate Ctrl
    Ctrl->>Svc: sendMessage(currentUserId, SendChatMessageRequest)
    activate Svc

    Svc->>MsgRepo: save(ChatMessage - fromUserId, toUserId, content, isRead: false)
    activate MsgRepo
    MsgRepo-->>Svc: ChatMessage (Saved)
    deactivate MsgRepo

    %% Push live to supporter via WebSocket
    Svc->>WSTemplate: convertAndSendToUser(supporterEmail, "/queue/messages", chatMessageResponse)
    
    Svc-->>Ctrl: ChatMessageResponse
    deactivate Svc
    Ctrl-->>Customer: 200 OK (ChatMessageResponse)
    deactivate Ctrl

    %% --- Supporter reads and marks as read ---
    Note over Supporter, Svc: Nhân viên đọc tin nhắn và đánh dấu đã đọc
    Supporter->>Ctrl: PUT /chat/mark-read/{customerId}
    activate Ctrl
    Ctrl->>Svc: markAsRead(supporterId, customerId)
    activate Svc
    Svc->>MsgRepo: updateIsReadBySenderAndReceiver(customerId, supporterId)
    Svc-->>Ctrl: void
    deactivate Svc
    Ctrl-->>Supporter: 200 OK (Messages marked as read)
    deactivate Ctrl

    %% --- Supporter replies ---
    Note over Supporter, Customer: Nhân viên phản hồi lại Khách hàng
    Supporter->>Ctrl: POST /chat/send (SendChatMessageRequest - toUserId: CustomerID)
    activate Ctrl
    Ctrl->>Svc: sendMessage(supporterId, SendChatMessageRequest)
    activate Svc

    Svc->>MsgRepo: save(ChatMessage - fromUserId: supporterId, toUserId: customerId, isRead: false)
    activate MsgRepo
    MsgRepo-->>Svc: ChatMessage (Saved)
    deactivate MsgRepo

    %% Push live to customer via WebSocket
    Svc->>WSTemplate: convertAndSendToUser(customerEmail, "/queue/messages", chatMessageResponse)

    Svc-->>Ctrl: ChatMessageResponse
    deactivate Svc
    Ctrl-->>Supporter: 200 OK (ChatMessageResponse)
    deactivate Ctrl
```
