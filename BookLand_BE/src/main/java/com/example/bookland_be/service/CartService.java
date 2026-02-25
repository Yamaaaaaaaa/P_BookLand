package com.example.bookland_be.service;


import com.example.bookland_be.dto.*;
import com.example.bookland_be.dto.request.AddToCartRequest;
import com.example.bookland_be.dto.request.UpdateCartItemRequest;
import com.example.bookland_be.entity.*;
import com.example.bookland_be.entity.Cart.CartStatus;
import com.example.bookland_be.exception.AppException;
import com.example.bookland_be.exception.ErrorCode;
import com.example.bookland_be.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    public CartDTO getUserCart(Long userId) {
        Cart cart = cartRepository.findByUserIdAndStatus(userId, CartStatus.BUYING)
                .orElseGet(() -> createNewCart(userId));
        return convertToDTO(cart);
    }

    @Transactional
    public CartDTO addToCart(Long userId, AddToCartRequest request) {
        Cart cart = cartRepository.findByUserIdAndStatus(userId, CartStatus.BUYING)
                .orElseGet(() -> createNewCart(userId));

        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));

        if (book.getStock() < request.getQuantity()) {
            throw new AppException(ErrorCode.BOOK_OUT_OF_STOCK);
        }

        CartItem existingItem = cartItemRepository
                .findByCartIdAndBookId(cart.getId(), book.getId())
                .orElse(null);

        if (existingItem != null) {
            int newQuantity = existingItem.getQuantity() + request.getQuantity();
            if (book.getStock() < newQuantity) {
                throw new AppException(ErrorCode.BOOK_OUT_OF_STOCK);
            }
            existingItem.setQuantity(newQuantity);
            cartItemRepository.save(existingItem);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .book(book)
                    .quantity(request.getQuantity())
                    .build();
            cartItemRepository.save(newItem);
            cart.getItems().add(newItem);
        }

        cartRepository.save(cart);
        return convertToDTO(cart);
    }

    @Transactional
    public CartDTO updateCartItem(Long userId, Long bookId, UpdateCartItemRequest request) {
        Cart cart = cartRepository.findByUserIdAndStatus(userId, CartStatus.BUYING)
                .orElseThrow(() -> new AppException(ErrorCode.CART_NOT_FOUND));

        CartItem cartItem = cartItemRepository.findByCartIdAndBookId(cart.getId(), bookId)
                .orElseThrow(() -> new AppException(ErrorCode.CART_ITEM_NOT_FOUND));

        Book book = cartItem.getBook();
        if (book.getStock() < request.getQuantity()) {
            throw new AppException(ErrorCode.BOOK_OUT_OF_STOCK);
        }

        cartItem.setQuantity(request.getQuantity());
        cartItemRepository.save(cartItem);

        return convertToDTO(cart);
    }

    @Transactional
    public CartDTO removeFromCart(Long userId, Long bookId) {
        Cart cart = cartRepository.findByUserIdAndStatus(userId, CartStatus.BUYING)
                .orElseThrow(() -> new AppException(ErrorCode.CART_NOT_FOUND));

        CartItem cartItem = cartItemRepository.findByCartIdAndBookId(cart.getId(), bookId)
                .orElseThrow(() -> new AppException(ErrorCode.CART_ITEM_NOT_FOUND));

        cart.getItems().remove(cartItem);
        cartItemRepository.delete(cartItem);
        cartRepository.save(cart);

        return convertToDTO(cart);
    }

    @Transactional
    public CartDTO removeMultipleFromCart(Long userId, List<Long> bookIds) {
        Cart cart = cartRepository.findByUserIdAndStatus(userId, CartStatus.BUYING)
                .orElseThrow(() -> new AppException(ErrorCode.CART_NOT_FOUND));

        List<CartItem> itemsToRemove = cartItemRepository
                .findByCartIdAndBookIdIn(cart.getId(), bookIds);

        cart.getItems().removeAll(itemsToRemove);
        cartItemRepository.deleteAllInBatch(itemsToRemove);
        cartRepository.save(cart);

        return convertToDTO(cart);
    }

    @Transactional
    public void clearCart(Long userId) {
        Cart cart = cartRepository.findByUserIdAndStatus(userId, CartStatus.BUYING)
                .orElseThrow(() -> new AppException(ErrorCode.CART_NOT_FOUND));

        cart.getItems().clear();
        cartRepository.save(cart);
    }

    private Cart createNewCart(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Cart cart = Cart.builder()
                .user(user)
                .status(CartStatus.BUYING)
                .build();

        return cartRepository.save(cart);
    }

    private CartDTO convertToDTO(Cart cart) {
        List<CartItemDTO> itemDTOs = cart.getItems().stream()
                .map(this::convertItemToDTO)
                .collect(Collectors.toList());

        double totalAmount = itemDTOs.stream()
                .mapToDouble(CartItemDTO::getSubtotal)
                .sum();

        return CartDTO.builder()
                .id(cart.getId())
                .userId(cart.getUser().getId())
                .status(cart.getStatus())
                .items(itemDTOs)
                .totalAmount(totalAmount)
                .createdAt(cart.getCreatedAt())
                .updatedAt(cart.getUpdatedAt())
                .build();
    }

    private CartItemDTO convertItemToDTO(CartItem item) {
        Book book = item.getBook();
        double finalPrice = book.getFinalPrice();
        double subtotal = finalPrice * item.getQuantity();

        return CartItemDTO.builder()
                .bookId(book.getId())
                .bookName(book.getName())
                .bookImageUrl(book.getBookImageUrl())
                .originalPrice(book.getOriginalCost())
                .salePrice(book.getSale())
                .finalPrice(finalPrice)
                .quantity(item.getQuantity())
                .availableStock(book.getStock())
                .subtotal(subtotal)
                .build();
    }
}
