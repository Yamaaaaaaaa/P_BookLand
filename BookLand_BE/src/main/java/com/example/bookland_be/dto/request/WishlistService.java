package com.example.bookland_be.dto.request;

import com.example.bookland_be.dto.WishlistDTO;
import com.example.bookland_be.entity.Book;
import com.example.bookland_be.entity.User;
import com.example.bookland_be.entity.Wishlist;
import com.example.bookland_be.repository.BookRepository;
import com.example.bookland_be.repository.UserRepository;
import com.example.bookland_be.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;

    public List<WishlistDTO> getUserWishlist(Long userId) {
        return wishlistRepository.findByUserId(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public WishlistDTO addToWishlist(Long userId, AddToWishlistRequest request) {
        if (wishlistRepository.existsByUserIdAndBookId(userId, request.getBookId())) {
            throw new RuntimeException("Book already in wishlist");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new RuntimeException("Book not found"));

        Wishlist wishlist = Wishlist.builder()
                .user(user)
                .book(book)
                .build();

        Wishlist saved = wishlistRepository.save(wishlist);
        return convertToDTO(saved);
    }

    @Transactional
    public void removeFromWishlist(Long userId, Long bookId) {
        Wishlist wishlist = wishlistRepository.findByUserIdAndBookId(userId, bookId)
                .orElseThrow(() -> new RuntimeException("Item not found in wishlist"));

        wishlistRepository.delete(wishlist);
    }

    @Transactional
    public void clearWishlist(Long userId) {
        List<Wishlist> wishlists = wishlistRepository.findByUserId(userId);
        wishlistRepository.deleteAll(wishlists);
    }

    public boolean isInWishlist(Long userId, Long bookId) {
        return wishlistRepository.existsByUserIdAndBookId(userId, bookId);
    }

    private WishlistDTO convertToDTO(Wishlist wishlist) {
        Book book = wishlist.getBook();

        return WishlistDTO.builder()
                .id(wishlist.getId())
                .userId(wishlist.getUser().getId())
                .bookId(book.getId())
                .bookName(book.getName())
                .bookImageUrl(book.getBookImageUrl())
                .originalPrice(book.getOriginalCost())
                .salePrice(book.getSale())
                .finalPrice(book.getFinalPrice())
                .stock(book.getStock())
                .createdAt(wishlist.getCreatedAt())
                .build();
    }
}
