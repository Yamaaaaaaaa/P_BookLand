package com.example.bookland_be.controller.common;

import com.example.bookland_be.config.VnpayConfig;
import com.example.bookland_be.dto.PaymentTransactionDTO;
import com.example.bookland_be.dto.response.ApiResponse;
import com.example.bookland_be.dto.response.NotificationResponse;
import com.example.bookland_be.dto.response.PaymentResponse;
import com.nimbusds.jose.shaded.gson.Gson;
import com.nimbusds.jose.shaded.gson.JsonObject;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import com.example.bookland_be.entity.Bill;
import com.example.bookland_be.entity.PaymentMethod;
import com.example.bookland_be.entity.PaymentTransaction;
import com.example.bookland_be.exception.AppException;
import com.example.bookland_be.exception.ErrorCode;
import com.example.bookland_be.repository.BillRepository;
import com.example.bookland_be.repository.PaymentMethodRepository;
import com.example.bookland_be.repository.PaymentTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@RestController
@RequestMapping("/api/online-payment")
@RequiredArgsConstructor
@Tag(name = "Payment APIs")
@SecurityRequirement(name = "BearerAuth")
public class PaymentController {

    private final BillRepository billRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final PaymentMethodRepository paymentMethodRepository;

    @PostMapping("create-payment")
    @Operation(summary = "Lấy ra URL để truy cập Sandbox thanh toán")
//    req: amount=50000
//         bankCode=NCB
//         language=vn
    public ApiResponse<PaymentResponse> createPayment(
            HttpServletRequest req,
            @RequestParam("billId") Long billId
    ) throws ServletException, IOException {

        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new AppException(ErrorCode.BILL_NOT_FOUND));

        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String orderType = "other";
        long amount = (long) (bill.getTotalCost() * 100); // Use bill amount
        // long amount = Integer.parseInt(req.getParameter("amount"))*100;
        String bankCode = req.getParameter("bankCode");

        String vnp_TxnRef = VnpayConfig.getRandomNumber(8);
        String vnp_IpAddr = VnpayConfig.getIpAddress(req);

        String vnp_TmnCode = VnpayConfig.vnp_TmnCode;

        // Save PENDING transaction
        PaymentMethod paymentMethod = bill.getPaymentMethod(); // Assuming bill has payment method, or fetch default VNPAY
        if(paymentMethod == null) {
             // Fallback or find VNPAY method if not set in bill
             paymentMethod = paymentMethodRepository.findByProviderCode("VNPAY") // You might need to implement this
                     .orElseThrow(() -> new RuntimeException("Payment method VNPAY not found"));
        }

        PaymentTransaction transaction = PaymentTransaction.builder()
                .bill(bill)
                .paymentMethod(paymentMethod)
                .provider("VNPAY")
                .amount(bill.getTotalCost())
                .transactionCode(vnp_TxnRef) // Use vnp_TxnRef as internal transaction code
                .status(PaymentTransaction.TransactionStatus.PENDING)
                .build();
        paymentTransactionRepository.save(transaction);


        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");

        if (bankCode != null && !bankCode.isEmpty()) {
            vnp_Params.put("vnp_BankCode", bankCode);
        }
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang:" + bill.getId()); // Use bill ID for info
        vnp_Params.put("vnp_OrderType", orderType);
        vnp_Params.put("vnp_ReturnUrl", VnpayConfig.vnp_ReturnUrl);

        String locate = req.getParameter("language");
        if (locate != null && !locate.isEmpty()) {
            vnp_Params.put("vnp_Locale", locate);
        } else {
            vnp_Params.put("vnp_Locale", "vn");
        }
        vnp_Params.put("vnp_ReturnUrl", VnpayConfig.vnp_ReturnUrl);
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        List fieldNames = new ArrayList(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = (String) itr.next();
            String fieldValue = (String) vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                //Build hash data
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                //Build query
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }
        String queryUrl = query.toString();
        String vnp_SecureHash = VnpayConfig.hmacSHA512(VnpayConfig.secretKey, hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        String paymentUrl = VnpayConfig.vnp_PayUrl + "?" + queryUrl;
//        JsonObject job = new JsonObject();
//        job.addProperty("code", "00");
//        job.addProperty("message", "success");
//        job.addProperty("data", paymentUrl);
//        Gson gson = new Gson();
//        resp.getWriter().write(gson.toJson(job));


        PaymentResponse paymentResponse = new PaymentResponse();
        paymentResponse.setStatus("OKE");
        paymentResponse.setMessage("Successfully");
        paymentResponse.setURL(paymentUrl);


        return ApiResponse.<PaymentResponse>builder()
                .result(paymentResponse)
                .build();
    }
    @GetMapping("/payment_infor")
    public ApiResponse<PaymentTransactionDTO> transaction(
            HttpServletRequest req,
            @RequestParam(value = "vnp_Amount") String amount,
            @RequestParam(value = "vnp_BankCode") String bankCode,
            @RequestParam(value = "vnp_OrderInfo") String order,
            @RequestParam(value = "vnp_ResponseCode") String responseCode
    ) {

        PaymentTransactionDTO transactionStatusDTO = new PaymentTransactionDTO();

        System.out.println("vnp_Amount: " + amount);
        System.out.println("vnp_BankCode: " + bankCode);
        System.out.println("vnp_OrderInfo: " + order);
        System.out.println("vnp_ResponseCode: " + responseCode);
        System.out.println("Full Query String: " + req.getQueryString());

        // 1. Validate Checksum
        // Collect all vnp params to verify hash
        Map<String, String> fields = new HashMap<>();
        for (Enumeration<String> params = req.getParameterNames(); params.hasMoreElements(); ) {
            String fieldName = params.nextElement();
            String fieldValue = req.getParameter(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                fields.put(fieldName, fieldValue);
            }
        }
        String vnp_SecureHash = req.getParameter("vnp_SecureHash");
        if (fields.containsKey("vnp_SecureHashType")) {
            fields.remove("vnp_SecureHashType");
        }
        if (fields.containsKey("vnp_SecureHash")) {
            fields.remove("vnp_SecureHash");
        }

        // Check checksum
        String signValue = VnpayConfig.hashAllFields(fields);
        if (!signValue.equals(vnp_SecureHash)) {
             System.out.println("Invalid Checksum: Calculated " + signValue + " != Received " + vnp_SecureHash);
             transactionStatusDTO.setStatus("NO");
             transactionStatusDTO.setMessage("Invalid Checksum");
             transactionStatusDTO.setData("");
             return ApiResponse.<PaymentTransactionDTO>builder()
                     .result(transactionStatusDTO)
                     .build();
        }

        // 2. Find Transaction
        // vnp_TxnRef was saved as transactionCode
        String vnp_TxnRef = req.getParameter("vnp_TxnRef");
        PaymentTransaction transaction = paymentTransactionRepository.findByTransactionCode(vnp_TxnRef)
                .orElse(null);

        if(transaction == null) {
            System.out.println("Transaction not found for code: " + vnp_TxnRef);
            transactionStatusDTO.setStatus("NO");
            transactionStatusDTO.setMessage("Transaction not found");
            return ApiResponse.<PaymentTransactionDTO>builder().result(transactionStatusDTO).build();
        }

        // 3. Update Status
        transaction.setResponseCode(responseCode);
        transaction.setResponseMessage(order); // vnp_OrderInfo
        transaction.setProviderTransactionId(req.getParameter("vnp_TransactionNo"));
        transaction.setPayUrl(req.getParameter("vnp_BankTranNo")); // Optional: save other info

        if (responseCode.equals("00")) {
            transaction.setStatus(PaymentTransaction.TransactionStatus.SUCCESS);
            transaction.setPaidAt(java.time.LocalDateTime.now());
            
            // Update Bill Status
            Bill bill = transaction.getBill();
            if(bill != null) {
                bill.setStatus(Bill.BillStatus.APPROVED);
                bill.setApprovedAt(java.time.LocalDateTime.now());
                billRepository.save(bill);
            }

            transactionStatusDTO.setStatus("OK");
            transactionStatusDTO.setMessage("Successfully");
            transactionStatusDTO.setData("");
        } else {
            transaction.setStatus(PaymentTransaction.TransactionStatus.FAILED);
            transactionStatusDTO.setStatus("NO");
            transactionStatusDTO.setMessage("Failed");
            transactionStatusDTO.setData("");
        }
        paymentTransactionRepository.save(transaction);
        return ApiResponse.<PaymentTransactionDTO>builder()
                .result(transactionStatusDTO)
                .build();
    }
}
