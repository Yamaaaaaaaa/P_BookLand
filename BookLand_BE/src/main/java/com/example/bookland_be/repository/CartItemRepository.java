package com.example.bookland_be.repository;

import com.example.bookland_be.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, CartItem.CartItemId> {

    List<CartItem> findByCartId(Long cartId);

    Optional<CartItem> findByCartIdAndBookId(Long cartId, Long bookId);

    List<CartItem> findByCartIdAndBookIdIn(Long cartId, List<Long> bookIds);

    @Modifying
    @Query("DELETE FROM CartItem ci WHERE ci.cart.id = :cartId")
    void deleteByCartId(@Param("cartId") Long cartId);

    @Modifying
    @Query("DELETE FROM CartItem ci WHERE ci.cart.id = :cartId AND ci.book.id = :bookId")
    void deleteByCartIdAndBookId(@Param("cartId") Long cartId, @Param("bookId") Long bookId);

    @Query("SELECT SUM(ci.quantity) FROM CartItem ci WHERE ci.cart.id = :cartId")
    Integer getTotalQuantityByCartId(@Param("cartId") Long cartId);
}
