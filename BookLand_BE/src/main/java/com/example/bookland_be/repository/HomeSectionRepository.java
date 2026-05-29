package com.example.bookland_be.repository;

import com.example.bookland_be.entity.HomeSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HomeSectionRepository extends JpaRepository<HomeSection, Long> {
    List<HomeSection> findAllByOrderByDisplayOrderAsc();
}
