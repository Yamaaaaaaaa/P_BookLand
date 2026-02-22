package com.example.bookland_be.service;

import com.example.bookland_be.dto.PaymentMethodDTO;
import com.example.bookland_be.dto.request.PaymentMethodRequest;
import com.example.bookland_be.entity.PaymentMethod;
import com.example.bookland_be.exception.AppException;
import com.example.bookland_be.exception.ErrorCode;
import com.example.bookland_be.repository.PaymentMethodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PaymentMethodService {

    private final PaymentMethodRepository paymentMethodRepository;

    @Transactional(readOnly = true)
    public Page<PaymentMethodDTO> getAllPaymentMethods(Pageable pageable) {
        return paymentMethodRepository.findAll(pageable)
                .map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public PaymentMethodDTO getPaymentMethodById(Long id) {
        PaymentMethod paymentMethod = paymentMethodRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_METHOD_NOT_FOUND));
        return convertToDTO(paymentMethod);
    }

    @Transactional
    public PaymentMethodDTO createPaymentMethod(PaymentMethodRequest request) {
        PaymentMethod paymentMethod = PaymentMethod.builder()
                .name(request.getName())
                .providerCode(request.getProviderCode())
                .isOnline(request.getIsOnline())
                .description(request.getDescription())
                .build();

        PaymentMethod saved = paymentMethodRepository.save(paymentMethod);
        return convertToDTO(saved);
    }

    @Transactional
    public PaymentMethodDTO updatePaymentMethod(Long id, PaymentMethodRequest request) {
        PaymentMethod paymentMethod = paymentMethodRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_METHOD_NOT_FOUND));

        paymentMethod.setName(request.getName());
        paymentMethod.setProviderCode(request.getProviderCode());
        paymentMethod.setIsOnline(request.getIsOnline());
        paymentMethod.setDescription(request.getDescription());

        PaymentMethod updated = paymentMethodRepository.save(paymentMethod);
        return convertToDTO(updated);
    }

    @Transactional
    public void deletePaymentMethod(Long id) {
        PaymentMethod paymentMethod = paymentMethodRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_METHOD_NOT_FOUND));

        if (!paymentMethod.getBills().isEmpty()) {
            throw new RuntimeException("Cannot delete payment method with existing bills");
        }
        if (!paymentMethod.getTransactions().isEmpty()) {
             throw new RuntimeException("Cannot delete payment method with existing transactions");
        }

        paymentMethodRepository.delete(paymentMethod);
    }

    private PaymentMethodDTO convertToDTO(PaymentMethod paymentMethod) {
        return PaymentMethodDTO.builder()
                .id(paymentMethod.getId())
                .name(paymentMethod.getName())
                .providerCode(paymentMethod.getProviderCode())
                .isOnline(paymentMethod.getIsOnline())
                .description(paymentMethod.getDescription())
                .build();
    }
}
