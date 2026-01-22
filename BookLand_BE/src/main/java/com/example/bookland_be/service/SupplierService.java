package com.example.bookland_be.service;


import com.example.bookland_be.dto.SupplierDTO;
import com.example.bookland_be.dto.request.SupplierRequest;
import com.example.bookland_be.entity.Supplier;
import com.example.bookland_be.entity.Supplier.SupplierStatus;
import com.example.bookland_be.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;

    public List<SupplierDTO> getAllSuppliers() {
        return supplierRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<SupplierDTO> getSuppliersByStatus(SupplierStatus status) {
        return supplierRepository.findByStatus(status).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public SupplierDTO getSupplierById(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found with id: " + id));
        return convertToDTO(supplier);
    }

    @Transactional
    public SupplierDTO createSupplier(SupplierRequest request) {
        Supplier supplier = Supplier.builder()
                .name(request.getName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .address(request.getAddress())
                .status(request.getStatus() != null ? request.getStatus() : SupplierStatus.ACTIVE)
                .build();

        Supplier saved = supplierRepository.save(supplier);
        return convertToDTO(saved);
    }

    @Transactional
    public SupplierDTO updateSupplier(Long id, SupplierRequest request) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found with id: " + id));

        supplier.setName(request.getName());
        supplier.setPhone(request.getPhone());
        supplier.setEmail(request.getEmail());
        supplier.setAddress(request.getAddress());
        supplier.setStatus(request.getStatus() != null ? request.getStatus() : supplier.getStatus());

        Supplier updated = supplierRepository.save(supplier);
        return convertToDTO(updated);
    }

    @Transactional
    public void deleteSupplier(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found with id: " + id));

        if (!supplier.getPurchaseInvoices().isEmpty()) {
            throw new RuntimeException("Cannot delete supplier with existing purchase invoices");
        }

        supplierRepository.delete(supplier);
    }

    private SupplierDTO convertToDTO(Supplier supplier) {
        return SupplierDTO.builder()
                .id(supplier.getId())
                .name(supplier.getName())
                .phone(supplier.getPhone())
                .email(supplier.getEmail())
                .address(supplier.getAddress())
                .status(supplier.getStatus())
                .build();
    }
}
