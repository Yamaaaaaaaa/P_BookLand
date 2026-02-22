// ======================================================
// 1. AuthorRepository.java
// ======================================================
package com.bookland.repository;

import com.bookland.entity.Author;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AuthorRepository extends JpaRepository<Author, Integer> {
    
    Optional<Author> findByName(String name);
    
    boolean existsByName(String name);
    
    @Query("SELECT a FROM Author a WHERE LOWER(a.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Author> searchByName(@Param("keyword") String keyword);
    
    @Query("SELECT a FROM Author a LEFT JOIN FETCH a.books WHERE a.id = :id")
    Optional<Author> findByIdWithBooks(@Param("id") Integer id);
}

// ======================================================
// 2. PublisherRepository.java
// ======================================================
package com.bookland.repository;

import com.bookland.entity.Publisher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PublisherRepository extends JpaRepository<Publisher, Integer> {
    
    Optional<Publisher> findByName(String name);
    
    boolean existsByName(String name);
    
    @Query("SELECT p FROM Publisher p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Publisher> searchByName(@Param("keyword") String keyword);
    
    @Query("SELECT p FROM Publisher p LEFT JOIN FETCH p.books WHERE p.id = :id")
    Optional<Publisher> findByIdWithBooks(@Param("id") Integer id);
}

// ======================================================
// 3. SerieRepository.java
// ======================================================
package com.bookland.repository;

import com.bookland.entity.Serie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SerieRepository extends JpaRepository<Serie, Integer> {
    
    Optional<Serie> findByName(String name);
    
    boolean existsByName(String name);
    
    @Query("SELECT s FROM Serie s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Serie> searchByName(@Param("keyword") String keyword);
    
    @Query("SELECT s FROM Serie s LEFT JOIN FETCH s.books WHERE s.id = :id")
    Optional<Serie> findByIdWithBooks(@Param("id") Integer id);
}

// ======================================================
// 4. CategoryRepository.java
// ======================================================
package com.bookland.repository;

import com.bookland.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Integer> {
    
    Optional<Category> findByName(String name);
    
    boolean existsByName(String name);
    
    @Query("SELECT c FROM Category c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Category> searchByName(@Param("keyword") String keyword);
    
    @Query("SELECT c FROM Category c LEFT JOIN FETCH c.books WHERE c.id = :id")
    Optional<Category> findByIdWithBooks(@Param("id") Integer id);
}

// ======================================================
// 5. UserRepository.java
// ======================================================
package com.bookland.repository;

import com.bookland.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    
    Optional<User> findByUsername(String username);
    
    Optional<User> findByEmail(String email);
    
    boolean existsByUsername(String username);
    
    boolean existsByEmail(String email);
    
    @Query("SELECT u FROM User u JOIN FETCH u.roles WHERE u.username = :username")
    Optional<User> findByUsernameWithRoles(@Param("username") String username);
    
    @Query("SELECT u FROM User u JOIN FETCH u.roles WHERE u.email = :email")
    Optional<User> findByEmailWithRoles(@Param("email") String email);
    
    @Query("SELECT u FROM User u WHERE u.status = :status")
    List<User> findByStatus(@Param("status") User.UserStatus status);
    
    @Query("SELECT u FROM User u WHERE LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<User> searchUsers(@Param("keyword") String keyword, Pageable pageable);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.status = 'ENABLE'")
    long countActiveUsers();
}

// ======================================================
// 6. AddressRepository.java
// ======================================================
package com.bookland.repository;

import com.bookland.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AddressRepository extends JpaRepository<Address, Integer> {
    
    List<Address> findByUserId(Integer userId);
    
    @Query("SELECT a FROM Address a WHERE a.user.id = :userId AND a.isDefault = true")
    Optional<Address> findDefaultByUserId(@Param("userId") Integer userId);
    
    @Query("SELECT a FROM Address a WHERE a.user.id = :userId ORDER BY a.isDefault DESC, a.id DESC")
    List<Address> findByUserIdOrderByDefault(@Param("userId") Integer userId);
}

// ======================================================
// 7. RoleRepository.java
// ======================================================
package com.bookland.repository;

import com.bookland.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Integer> {
    
    Optional<Role> findByName(String name);
    
    boolean existsByName(String name);
    
    @Query("SELECT r FROM Role r LEFT JOIN FETCH r.permissions WHERE r.id = :id")
    Optional<Role> findByIdWithPermissions(@Param("id") Integer id);
    
    @Query("SELECT r FROM Role r LEFT JOIN FETCH r.permissions WHERE r.name = :name")
    Optional<Role> findByNameWithPermissions(@Param("name") String name);
}

// ======================================================
// 8. PermissionRepository.java
// ======================================================
package com.bookland.repository;

import com.bookland.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Integer> {
    
    Optional<Permission> findByName(String name);
    
    boolean existsByName(String name);
}

// ======================================================
// 9. BookRepository.java
// ======================================================
package com.bookland.repository;

import com.bookland.entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<Book, Integer> {
    
    // Basic queries
    List<Book> findByStatus(Book.BookStatus status);
    
    Page<Book> findByStatus(Book.BookStatus status, Pageable pageable);
    
    List<Book> findByPinTrue();
    
    @Query("SELECT b FROM Book b WHERE b.status = 'ENABLE' AND b.pin = true ORDER BY b.createdAt DESC")
    List<Book> findPinnedBooks();
    
    // Search queries
    @Query("SELECT b FROM Book b WHERE b.status = 'ENABLE' AND " +
           "(LOWER(b.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(b.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Book> searchBooks(@Param("keyword") String keyword, Pageable pageable);
    
    // Filter by relationships
    Page<Book> findByAuthorId(Integer authorId, Pageable pageable);
    
    Page<Book> findByPublisherId(Integer publisherId, Pageable pageable);
    
    Page<Book> findBySeriesId(Integer seriesId, Pageable pageable);
    
    @Query("SELECT b FROM Book b JOIN b.categories c WHERE c.id = :categoryId AND b.status = 'ENABLE'")
    Page<Book> findByCategoryId(@Param("categoryId") Integer categoryId, Pageable pageable);
    
    // Fetch with relationships
    @Query("SELECT b FROM Book b " +
           "LEFT JOIN FETCH b.author " +
           "LEFT JOIN FETCH b.publisher " +
           "LEFT JOIN FETCH b.series " +
           "WHERE b.id = :id")
    Optional<Book> findByIdWithDetails(@Param("id") Integer id);
    
    @Query("SELECT DISTINCT b FROM Book b " +
           "LEFT JOIN FETCH b.categories " +
           "WHERE b.id = :id")
    Optional<Book> findByIdWithCategories(@Param("id") Integer id);
    
    // Price range filter
    @Query("SELECT b FROM Book b WHERE b.status = 'ENABLE' " +
           "AND (b.originalCost - (b.originalCost * b.sale / 100)) BETWEEN :minPrice AND :maxPrice")
    Page<Book> findByPriceRange(@Param("minPrice") Integer minPrice, 
                                 @Param("maxPrice") Integer maxPrice, 
                                 Pageable pageable);
    
    // Stock queries
    @Query("SELECT b FROM Book b WHERE b.stock > 0 AND b.status = 'ENABLE'")
    Page<Book> findInStockBooks(Pageable pageable);
    
    @Query("SELECT b FROM Book b WHERE b.stock < :threshold AND b.status = 'ENABLE'")
    List<Book> findLowStockBooks(@Param("threshold") Integer threshold);
    
    // Sales queries
    @Query("SELECT b FROM Book b WHERE b.sale > 0 AND b.status = 'ENABLE' ORDER BY b.sale DESC")
    Page<Book> findBooksOnSale(Pageable pageable);
    
    // Statistics
    @Query("SELECT COUNT(b) FROM Book b WHERE b.status = 'ENABLE'")
    long countActiveBooks();
    
    @Query("SELECT SUM(b.stock) FROM Book b WHERE b.status = 'ENABLE'")
    Long getTotalStock();
    
    // New arrivals
    @Query("SELECT b FROM Book b WHERE b.status = 'ENABLE' ORDER BY b.createdAt DESC")
    Page<Book> findNewArrivals(Pageable pageable);
    
    // Best sellers (based on bill_book quantity)
    @Query("SELECT b FROM Book b " +
           "JOIN b.billBooks bb " +
           "GROUP BY b " +
           "ORDER BY SUM(bb.quantity) DESC")
    Page<Book> findBestSellers(Pageable pageable);
}

// ======================================================
// 10. CartRepository.java
// ======================================================
package com.bookland.repository;

import com.bookland.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Integer> {
    
    Optional<Cart> findByUserIdAndStatus(Integer userId, Cart.CartStatus status);
    
    List<Cart> findByUserId(Integer userId);
    
    @Query("SELECT c FROM Cart c LEFT JOIN FETCH c.items WHERE c.id = :id")
    Optional<Cart> findByIdWithItems(@Param("id") Integer id);
    
    @Query("SELECT c FROM Cart c " +
           "LEFT JOIN FETCH c.items ci " +
           "LEFT JOIN FETCH ci.book " +
           "WHERE c.user.id = :userId AND c.status = :status")
    Optional<Cart> findByUserIdAndStatusWithItems(@Param("userId") Integer userId, 
                                                    @Param("status") Cart.CartStatus status);
}

// ======================================================
// 11. CartItemRepository.java
// ======================================================
package com.bookland.repository;

import com.bookland.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, CartItem.CartItemId> {
    
    List<CartItem> findByCartId(Integer cartId);
    
    Optional<CartItem> findByCartIdAndBookId(Integer cartId, Integer bookId);
    
    @Modifying
    @Query("DELETE FROM CartItem ci WHERE ci.cart.id = :cartId")
    void deleteByCartId(@Param("cartId") Integer cartId);
    
    @Modifying
    @Query("DELETE FROM CartItem ci WHERE ci.cart.id = :cartId AND ci.book.id = :bookId")
    void deleteByCartIdAndBookId(@Param("cartId") Integer cartId, @Param("bookId") Integer bookId);
    
    @Query("SELECT SUM(ci.quantity) FROM CartItem ci WHERE ci.cart.id = :cartId")
    Integer getTotalQuantityByCartId(@Param("cartId") Integer cartId);
}

// ======================================================
// 12. WishlistRepository.java
// ======================================================
package com.bookland.repository;

import com.bookland.entity.Wishlist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Integer> {
    
    List<Wishlist> findByUserId(Integer userId);
    
    Page<Wishlist> findByUserId(Integer userId, Pageable pageable);
    
    Optional<Wishlist> findByUserIdAndBookId(Integer userId, Integer bookId);
    
    boolean existsByUserIdAndBookId(Integer userId, Integer bookId);
    
    void deleteByUserIdAndBookId(Integer userId, Integer bookId);
    
    @Query("SELECT w FROM Wishlist w " +
           "LEFT JOIN FETCH w.book b " +
           "LEFT JOIN FETCH b.author " +
           "LEFT JOIN FETCH b.publisher " +
           "WHERE w.user.id = :userId")
    List<Wishlist> findByUserIdWithBookDetails(@Param("userId") Integer userId);
    
    @Query("SELECT COUNT(w) FROM Wishlist w WHERE w.user.id = :userId")
    long countByUserId(@Param("userId") Integer userId);
}

// ======================================================
// 13. BookCommentRepository.java
// ======================================================
package com.bookland.repository;

import com.bookland.entity.BookComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookCommentRepository extends JpaRepository<BookComment, Integer> {
    
    List<BookComment> findByBookId(Integer bookId);
    
    Page<BookComment> findByBookId(Integer bookId, Pageable pageable);
    
    List<BookComment> findByUserId(Integer userId);
    
    Page<BookComment> findByBookIdOrderByCreatedAtDesc(Integer bookId, Pageable pageable);
    
    @Query("SELECT bc FROM BookComment bc " +
           "LEFT JOIN FETCH bc.user " +
           "WHERE bc.book.id = :bookId " +
           "ORDER BY bc.createdAt DESC")
    List<BookComment> findByBookIdWithUser(@Param("bookId") Integer bookId);
    
    @Query("SELECT AVG(bc.rating) FROM BookComment bc WHERE bc.book.id = :bookId")
    Double getAverageRatingByBookId(@Param("bookId") Integer bookId);
    
    @Query("SELECT COUNT(bc) FROM BookComment bc WHERE bc.book.id = :bookId")
    long countByBookId(@Param("bookId") Integer bookId);
    
    @Query("SELECT COUNT(bc) FROM BookComment bc WHERE bc.book.id = :bookId AND bc.rating = :rating")
    long countByBookIdAndRating(@Param("bookId") Integer bookId, @Param("rating") Integer rating);
}

// ======================================================
// 14. PaymentMethodRepository.java
// ======================================================
package com.bookland.repository;

import com.bookland.entity.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, Integer> {
    
    Optional<PaymentMethod> findByProviderCode(String providerCode);
    
    List<PaymentMethod> findByIsOnline(Boolean isOnline);
}

// ======================================================
// 15. ShippingMethodRepository.java
// ======================================================
package com.bookland.repository;

import com.bookland.entity.ShippingMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShippingMethodRepository extends JpaRepository<ShippingMethod, Integer> {
    
    @Query("SELECT sm FROM ShippingMethod sm ORDER BY sm.price ASC")
    List<ShippingMethod> findAllOrderByPrice();
}

// ======================================================
// 16. BillRepository.java
// ======================================================
package com.bookland.repository;

import com.bookland.entity.Bill;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BillRepository extends JpaRepository<Bill, Integer> {
    
    // Filter by user
    Page<Bill> findByUserId(Integer userId, Pageable pageable);
    
    List<Bill> findByUserIdOrderByCreatedAtDesc(Integer userId);
    
    // Filter by status
    Page<Bill> findByStatus(Bill.BillStatus status, Pageable pageable);
    
    List<Bill> findByUserIdAndStatus(Integer userId, Bill.BillStatus status);
    
    // Fetch with relationships
    @Query("SELECT b FROM Bill b " +
           "LEFT JOIN FETCH b.billBooks bb " +
           "LEFT JOIN FETCH bb.book " +
           "WHERE b.id = :id")
    Optional<Bill> findByIdWithBillBooks(@Param("id") Integer id);
    
    @Query("SELECT b FROM Bill b " +
           "LEFT JOIN FETCH b.user " +
           "LEFT JOIN FETCH b.paymentMethod " +
           "LEFT JOIN FETCH b.shippingMethod " +
           "WHERE b.id = :id")
    Optional<Bill> findByIdWithDetails(@Param("id") Integer id);
    
    // Date range queries
    @Query("SELECT b FROM Bill b WHERE b.createdAt BETWEEN :startDate AND :endDate")
    List<Bill> findByDateRange(@Param("startDate") LocalDateTime startDate, 
                                @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT b FROM Bill b WHERE b.createdAt BETWEEN :startDate AND :endDate " +
           "AND b.status = :status")
    List<Bill> findByDateRangeAndStatus(@Param("startDate") LocalDateTime startDate, 
                                         @Param("endDate") LocalDateTime endDate,
                                         @Param("status") Bill.BillStatus status);
    
    // Statistics
    @Query("SELECT SUM(b.totalCost) FROM Bill b WHERE b.status = 'COMPLETED'")
    Long getTotalRevenue();
    
    @Query("SELECT SUM(b.totalCost) FROM Bill b " +
           "WHERE b.status = 'COMPLETED' " +
           "AND b.createdAt BETWEEN :startDate AND :endDate")
    Long getRevenueByDateRange(@Param("startDate") LocalDateTime startDate, 
                                @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT COUNT(b) FROM Bill b WHERE b.status = :status")
    long countByStatus(@Param("status") Bill.BillStatus status);
    
    @Query("SELECT COUNT(b) FROM Bill b WHERE b.user.id = :userId")
    long countByUserId(@Param("userId") Integer userId);
}

// ======================================================
// 17. BillBookRepository.java
// ======================================================
package com.bookland.repository;

import com.bookland.entity.BillBook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BillBookRepository extends JpaRepository<BillBook, BillBook.BillBookId> {
    
    List<BillBook> findByBillId(Integer billId);
    
    @Query("SELECT bb FROM BillBook bb " +
           "LEFT JOIN FETCH bb.book " +
           "WHERE bb.bill.id = :billId")
    List<BillBook> findByBillIdWithBook(@Param("billId") Integer billId);
    
    @Query("SELECT SUM(bb.quantity) FROM BillBook bb WHERE bb.book.id = :bookId")
    Long getTotalQuantitySoldByBookId(@Param("bookId") Integer bookId);
}

// ======================================================
// 18. PaymentTransactionRepository.java
// ======================================================
package com.bookland.repository;

import com.bookland.entity.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Integer> {
    
    Optional<PaymentTransaction> findByTransactionCode(String transactionCode);
    
    Optional<PaymentTransaction> findByProviderTransactionId(String providerTransactionId);
    
    List<PaymentTransaction> findByBillId(Integer billId);
    
    List<PaymentTransaction> findByStatus(PaymentTransaction.TransactionStatus status);
    
    @Query("SELECT pt FROM PaymentTransaction pt WHERE pt.bill.id = :billId AND pt.status = 'SUCCESS'")
    Optional<PaymentTransaction> findSuccessfulTransactionByBillId(@Param("billId") Integer billId);
}


// ======================================================
// 19. NotificationRepository.java
// ======================================================
package com.bookland.repository;

import com.bookland.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    
    // Find by user
    Page<Notification> findByToIdOrderByCreatedAtDesc(Integer toId, Pageable pageable);
    
    List<Notification> findByToIdOrderByCreatedAtDesc(Integer toId);
    
    // Filter by status
    List<Notification> findByToIdAndStatus(Integer toId, Notification.NotificationStatus status);
    
    Page<Notification> findByToIdAndStatusOrderByCreatedAtDesc(Integer toId, 
                                                                 Notification.NotificationStatus status, 
                                                                 Pageable pageable);
    
    // Count unread
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.to.id = :toId AND n.status = 'UNREAD'")
    long countUnreadByUserId(@Param("toId") Integer toId);
    
    // Mark as read
    @Modifying
    @Query("UPDATE Notification n SET n.status = 'READ', n.readAt = :readAt WHERE n.id = :id")
    void markAsRead(@Param("id") Integer id, @Param("readAt") LocalDateTime readAt);
    
    @Modifying
    @Query("UPDATE Notification n SET n.status = 'READ', n.readAt = :readAt " +
           "WHERE n.to.id = :toId AND n.status = 'UNREAD'")
    void markAllAsReadByUserId(@Param("toId") Integer toId, @Param("readAt") LocalDateTime readAt);
    
    // Delete old notifications
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.createdAt < :beforeDate")
    void deleteOldNotifications(@Param("beforeDate") LocalDateTime beforeDate);
    
    // Find by type
    List<Notification> findByToIdAndType(Integer toId, String type);
}

// ======================================================
// 20. EventRepository.java
// ======================================================
package com.bookland.repository;

import com.bookland.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventRepository extends JpaRepository<Event, Integer> {
    
    List<Event> findByStatus(Event.EventStatus status);
    
    List<Event> findByType(String type);
    
    // Find active events
    @Query("SELECT e FROM Event e WHERE e.status = 'ACTIVE' " +
           "AND e.startTime <= :now AND e.endTime >= :now " +
           "ORDER BY e.priority DESC, e.startTime ASC")
    List<Event> findActiveEvents(@Param("now") LocalDateTime now);
    
    // Find with details
    @Query("SELECT e FROM Event e " +
           "LEFT JOIN FETCH e.targets " +
           "LEFT JOIN FETCH e.rules " +
           "LEFT JOIN FETCH e.actions " +
           "WHERE e.id = :id")
    Optional<Event> findByIdWithDetails(@Param("id") Integer id);
    
    // Find events for a specific book
    @Query("SELECT e FROM Event e " +
           "JOIN e.targets t " +
           "WHERE e.status = 'ACTIVE' " +
           "AND e.startTime <= :now AND e.endTime >= :now " +
           "AND t.targetType = 'BOOK' AND t.targetId = :bookId " +
           "ORDER BY e.priority DESC")
    List<Event> findActiveEventsByBookId(@Param("bookId") Integer bookId, 
                                          @Param("now") LocalDateTime now);
    
    // Find events for a category
    @Query("SELECT e FROM Event e " +
           "JOIN e.targets t " +
           "WHERE e.status = 'ACTIVE' " +
           "AND e.startTime <= :now AND e.endTime >= :now " +
           "AND t.targetType = 'CATEGORY' AND t.targetId = :categoryId " +
           "ORDER BY e.priority DESC")
    List<Event> findActiveEventsByCategoryId(@Param("categoryId") Integer categoryId, 
                                              @Param("now") LocalDateTime now);
    
    // Find expired events
    @Query("SELECT e FROM Event e WHERE e.status = 'ACTIVE' AND e.endTime < :now")
    List<Event> findExpiredEvents(@Param("now") LocalDateTime now);
    
    // Find upcoming events
    @Query("SELECT e FROM Event e WHERE e.status = 'ACTIVE' AND e.startTime > :now " +
           "ORDER BY e.startTime ASC")
    List<Event> findUpcomingEvents(@Param("now") LocalDateTime now);
}

// ======================================================
// 21. EventTargetRepository.java
// ======================================================
package com.bookland.repository;

import com.bookland.entity.EventTarget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventTargetRepository extends JpaRepository<EventTarget, Integer> {
    
    List<EventTarget> findByEventId(Integer eventId);
    
    List<EventTarget> findByTargetTypeAndTargetId(String targetType, Integer targetId);
    
    @Modifying
    @Query("DELETE FROM EventTarget et WHERE et.event.id = :eventId")
    void deleteByEventId(@Param("eventId") Integer eventId);
}

// ======================================================
// 22. EventRuleRepository.java
// ======================================================
package com.bookland.repository;

import com.bookland.entity.EventRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRuleRepository extends JpaRepository<EventRule, Integer> {
    
    List<EventRule> findByEventId(Integer eventId);
    
    List<EventRule> findByEventIdAndRuleType(Integer eventId, String ruleType);
    
    @Modifying
    @Query("DELETE FROM EventRule er WHERE er.event.id = :eventId")
    void deleteByEventId(@Param("eventId") Integer eventId);
}

// ======================================================
// 23. EventActionRepository.java
// ======================================================
package com.bookland.repository;

import com.bookland.entity.EventAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventActionRepository extends JpaRepository<EventAction, Integer> {
    
    List<EventAction> findByEventId(Integer eventId);
    
    List<EventAction> findByEventIdAndActionType(Integer eventId, String actionType);
    
    @Modifying
    @Query("DELETE FROM EventAction ea WHERE ea.event.id = :eventId")
    void deleteByEventId(@Param("eventId") Integer eventId);
}

// ======================================================
// 24. EventLogRepository.java
// ======================================================
package com.bookland.repository;

import com.bookland.entity.EventLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventLogRepository extends JpaRepository<EventLog, Integer> {
    
    List<EventLog> findByEventId(Integer eventId);
    
    Page<EventLog> findByEventId(Integer eventId, Pageable pageable);
    
    List<EventLog> findByUserId(Integer userId);
    
    List<EventLog> findByBillId(Integer billId);
    
    @Query("SELECT el FROM EventLog el WHERE el.event.id = :eventId " +
           "AND el.createdAt BETWEEN :startDate AND :endDate")
    List<EventLog> findByEventIdAndDateRange(@Param("eventId") Integer eventId,
                                              @Param("startDate") LocalDateTime startDate,
                                              @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT COUNT(el) FROM EventLog el WHERE el.event.id = :eventId")
    long countByEventId(@Param("eventId") Integer eventId);
    
    @Query("SELECT SUM(el.appliedValue) FROM EventLog el WHERE el.event.id = :eventId")
    Long getTotalDiscountByEventId(@Param("eventId") Integer eventId);
}

// ======================================================
// 25. SupplierRepository.java
// ======================================================
package com.bookland.repository;

import com.bookland.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Integer> {
    
    List<Supplier> findByStatus(Supplier.SupplierStatus status);
    
    @Query("SELECT s FROM Supplier s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(s.email) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Supplier> searchSuppliers(@Param("keyword") String keyword);
    
    boolean existsByEmail(String email);
}

// ======================================================
// 26. PurchaseInvoiceRepository.java
// ======================================================
package com.bookland.repository;

import com.bookland.entity.PurchaseInvoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PurchaseInvoiceRepository extends JpaRepository<PurchaseInvoice, Integer> {
    
    List<PurchaseInvoice> findBySupplierId(Integer supplierId);
    
    Page<PurchaseInvoice> findBySupplierId(Integer supplierId, Pageable pageable);
    
    List<PurchaseInvoice> findByStatus(PurchaseInvoice.PurchaseStatus status);
    
    Page<PurchaseInvoice> findByStatus(PurchaseInvoice.PurchaseStatus status, Pageable pageable);
    
    @Query("SELECT pi FROM PurchaseInvoice pi " +
           "LEFT JOIN FETCH pi.purchaseInvoiceBooks pib " +
           "LEFT JOIN FETCH pib.book " +
           "WHERE pi.id = :id")
    Optional<PurchaseInvoice> findByIdWithBooks(@Param("id") Integer id);
    
    @Query("SELECT pi FROM PurchaseInvoice pi " +
           "LEFT JOIN FETCH pi.supplier " +
           "LEFT JOIN FETCH pi.creator " +
           "WHERE pi.id = :id")
    Optional<PurchaseInvoice> findByIdWithDetails(@Param("id") Integer id);
    
    @Query("SELECT pi FROM PurchaseInvoice pi WHERE pi.createdAt BETWEEN :startDate AND :endDate")
    List<PurchaseInvoice> findByDateRange(@Param("startDate") LocalDateTime startDate,
                                           @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT SUM(pi.totalCost) FROM PurchaseInvoice pi WHERE pi.status = 'COMPLETED'")
    Long getTotalPurchaseCost();
    
    @Query("SELECT SUM(pi.totalCost) FROM PurchaseInvoice pi " +
           "WHERE pi.status = 'COMPLETED' AND pi.createdAt BETWEEN :startDate AND :endDate")
    Long getPurchaseCostByDateRange(@Param("startDate") LocalDateTime startDate,
                                     @Param("endDate") LocalDateTime endDate);
}

// ======================================================
// 27. PurchaseInvoiceBookRepository.java
// ======================================================
package com.bookland.repository;

import com.bookland.entity.PurchaseInvoiceBook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseInvoiceBookRepository extends JpaRepository<PurchaseInvoiceBook, PurchaseInvoiceBook.PurchaseInvoiceBookId> {
    
    List<PurchaseInvoiceBook> findByPurchaseInvoiceId(Integer purchaseInvoiceId);
    
    @Query("SELECT pib FROM PurchaseInvoiceBook pib " +
           "LEFT JOIN FETCH pib.book " +
           "WHERE pib.purchaseInvoice.id = :invoiceId")
    List<PurchaseInvoiceBook> findByPurchaseInvoiceIdWithBook(@Param("invoiceId") Integer invoiceId);
    
    @Query("SELECT SUM(pib.quantity) FROM PurchaseInvoiceBook pib WHERE pib.book.id = :bookId")
    Long getTotalQuantityImportedByBookId(@Param("bookId") Integer bookId);
}

// ======================================================
// REPOSITORY SUMMARY & USAGE EXAMPLES
// ======================================================

/**
 * REPOSITORY PATTERN SUMMARY:
 * 
 * 27 Repositories tương ứng với 27 Entities
 * - Extend JpaRepository<Entity, ID> để có sẵn CRUD operations
 * - Custom query methods với naming convention
 * - @Query annotation cho complex queries
 * - Pagination support với Pageable
 * - JOIN FETCH để tối ưu N+1 query problem
 * 
 * USAGE EXAMPLES:
 * 
 * 1. Basic CRUD:
 *    bookRepository.findById(1);
 *    bookRepository.save(book);
 *    bookRepository.deleteById(1);
 * 
 * 2. Custom Finder:
 *    userRepository.findByUsername("admin");
 *    bookRepository.findByStatus(BookStatus.ENABLE);
 * 
 * 3. Pagination:
 *    Pageable pageable = PageRequest.of(0, 10, Sort.by("createdAt").descending());
 *    Page<Book> books = bookRepository.findByStatus(BookStatus.ENABLE, pageable);
 * 
 * 4. Custom Query:
 *    List<Book> books = bookRepository.searchBooks("Harry Potter", pageable);
 * 
 * 5. Join Fetch (Avoid N+1):
 *    Optional<Book> book = bookRepository.findByIdWithDetails(1);
 * 
 * 6. Statistics:
 *    Long revenue = billRepository.getTotalRevenue();
 *    Double avgRating = bookCommentRepository.getAverageRatingByBookId(1);
 * 
 * 7. Complex Filters:
 *    List<Book> books = bookRepository.findByPriceRange(50000, 200000, pageable);
 * 
 * IMPORTANT NOTES:
 * - Always use @Transactional for @Modifying queries
 * - Use Pageable for large datasets
 * - Consider using Specification for dynamic queries
 * - Use JOIN FETCH wisely to avoid Cartesian product
 * - Cache frequently accessed data with @Cacheable
 */