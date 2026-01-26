// SupplierService.java
package com.example.bookland_be.service;

import com.example.bookland_be.dto.SupplierDTO;
import com.example.bookland_be.dto.request.SupplierRequest;
import com.example.bookland_be.entity.Supplier;
import com.example.bookland_be.entity.Supplier.SupplierStatus;
import com.example.bookland_be.exception.AppException;
import com.example.bookland_be.exception.ErrorCode;
import com.example.bookland_be.repository.SupplierRepository;
import com.example.bookland_be.repository.specification.SupplierSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;

    @Transactional(readOnly = true)
    public Page<SupplierDTO> getAllSuppliers(String keyword, SupplierStatus status, Pageable pageable) {
        Specification<Supplier> spec = SupplierSpecification.searchByKeyword(keyword)
                .and(SupplierSpecification.hasStatus(status));

        return supplierRepository.findAll(spec, pageable)
                .map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public SupplierDTO getSupplierById(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SUPPLIER_NOT_FOUND));
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
                .orElseThrow(() -> new AppException(ErrorCode.SUPPLIER_NOT_FOUND));

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
                .orElseThrow(() -> new AppException(ErrorCode.SUPPLIER_NOT_FOUND));

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
