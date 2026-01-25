// ShippingMethodService.java
package com.example.bookland_be.service;

import com.example.bookland_be.dto.ShippingMethodDTO;
import com.example.bookland_be.dto.request.ShippingMethodRequest;
import com.example.bookland_be.entity.ShippingMethod;
import com.example.bookland_be.repository.ShippingMethodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ShippingMethodService {

    private final ShippingMethodRepository shippingMethodRepository;

    @Transactional(readOnly = true)
    public Page<ShippingMethodDTO> getAllShippingMethods(Pageable pageable) {
        return shippingMethodRepository.findAll(pageable)
                .map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public ShippingMethodDTO getShippingMethodById(Long id) {
        ShippingMethod shippingMethod = shippingMethodRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shipping method not found with id: " + id));
        return convertToDTO(shippingMethod);
    }

    @Transactional
    public ShippingMethodDTO createShippingMethod(ShippingMethodRequest request) {
        ShippingMethod shippingMethod = ShippingMethod.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .build();

        ShippingMethod saved = shippingMethodRepository.save(shippingMethod);
        return convertToDTO(saved);
    }

    @Transactional
    public ShippingMethodDTO updateShippingMethod(Long id, ShippingMethodRequest request) {
        ShippingMethod shippingMethod = shippingMethodRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shipping method not found with id: " + id));

        shippingMethod.setName(request.getName());
        shippingMethod.setDescription(request.getDescription());
        shippingMethod.setPrice(request.getPrice());

        ShippingMethod updated = shippingMethodRepository.save(shippingMethod);
        return convertToDTO(updated);
    }

    @Transactional
    public void deleteShippingMethod(Long id) {
        ShippingMethod shippingMethod = shippingMethodRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shipping method not found with id: " + id));

        if (!shippingMethod.getBills().isEmpty()) {
            throw new RuntimeException("Cannot delete shipping method with existing orders");
        }

        shippingMethodRepository.delete(shippingMethod);
    }

    private ShippingMethodDTO convertToDTO(ShippingMethod shippingMethod) {
        return ShippingMethodDTO.builder()
                .id(shippingMethod.getId())
                .name(shippingMethod.getName())
                .description(shippingMethod.getDescription())
                .price(shippingMethod.getPrice())
                .build();
    }
}