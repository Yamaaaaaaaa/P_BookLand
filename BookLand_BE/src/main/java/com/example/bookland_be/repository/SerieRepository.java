package com.example.bookland_be.repository;

import com.example.bookland_be.entity.Serie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface SerieRepository extends JpaRepository<Serie, Long>, JpaSpecificationExecutor<Serie> {
    boolean existsByName(String name);
}