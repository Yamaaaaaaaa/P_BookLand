package com.example.bookland_be.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.util.ArrayList;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Autowired
    private CustomJwtDecoder customJwtDecoder;


    // cấu hình message broker
    // MessageBrokerRegistry: dùng để cấu hình message broker (nơi trung gian chuyển tiếp message giữa client và server)
    @Override
    public void configureMessageBroker(@NonNull MessageBrokerRegistry config) {
        // /topic: dùng để gửi message đến nhiều người (publish-subscribe)
        // /queue: dùng để gửi message đến một người (point-to-point)
        config.enableSimpleBroker("/topic", "/queue"); // prefix gửi đi
        // "/app": dùng để gửi message từ client đến server (client gửi message đến server với prefix này)
        config.setApplicationDestinationPrefixes("/app"); // prefix nhận
        // "/user": dùng để gửi message riêng tư đến một user cụ thể
        config.setUserDestinationPrefix("/user"); // prefix cho private mesage 
    }   

    // đăng ký endpoint để kết nối socket 
    @Override
    public void registerStompEndpoints(@NonNull StompEndpointRegistry registry) {
        registry.addEndpoint("/ws") // endpoint để kết nối socket 
                .setAllowedOriginPatterns("*") // cho phép tất cả origin làm việc với socket
                .withSockJS(); // sử dụng sockJS để fallback khi không hỗ trợ websocket
    }

    // cấu hình interceptor để xác thực token và gán user vào socket 
    // ChannelRegistration: dùng để cấu hình interceptor cho channel (interceptor là nơi xử lý logic trước khi message được gửi đi hoặc nhận về)
    @Override
    public void configureClientInboundChannel(@NonNull ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            // preSend: được gọi trước khi message được gửi đi 
                // Nhiệm vụ preSend: xác thực token và gán user vào socket 
            @Override
            public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
                StompHeaderAccessor accessor = 
                        MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                
                if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String authHeader = accessor.getFirstNativeHeader("Authorization");
                    if (authHeader != null && authHeader.startsWith("Bearer ")) {
                        String token = authHeader.substring(7);
                        try {
                            Jwt jwt = customJwtDecoder.decode(token);
                            String email = jwt.getSubject();
                            
                            Authentication authentication = new UsernamePasswordAuthenticationToken(email, null, new ArrayList<>());
                            accessor.setUser(authentication);
                        } catch (Exception e) {
                            // Handle invalid token if necessary
                        }
                    }
                }
                return message;
            }
        });
    }

}
