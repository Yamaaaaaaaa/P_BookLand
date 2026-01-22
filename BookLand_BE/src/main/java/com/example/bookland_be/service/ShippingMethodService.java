package com.example.bookland_be.service;

import com.example.bookland_be.dto.ShippingMethodDTO;
import com.example.bookland_be.dto.request.ShippingMethodRequest;
import com.example.bookland_be.entity.ShippingMethod;
import com.example.bookland_be.repository.ShippingMethodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShippingMethodService {

    private final ShippingMethodRepository shippingMethodRepository;

    public List<ShippingMethodDTO> getAllShippingMethods() {
        return shippingMethodRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

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
