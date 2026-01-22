package com.example.bookland_be.repository;

import com.example.bookland_be.entity.Serie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SerieRepository extends JpaRepository<Serie, Long> {

    Optional<Serie> findByName(String name);

    boolean existsByName(String name);

    @Query("SELECT s FROM Serie s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Serie> searchByName(@Param("keyword") String keyword);

    @Query("SELECT s FROM Serie s LEFT JOIN FETCH s.books WHERE s.id = :id")
    Optional<Serie> findByIdWithBooks(@Param("id") Long id);
}

