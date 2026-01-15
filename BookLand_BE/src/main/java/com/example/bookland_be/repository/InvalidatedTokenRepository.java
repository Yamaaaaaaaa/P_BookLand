package com.example.bookland_be.repository;

import com.example.bookland_be.entity.InvalidatedToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;



@Repository
public interface InvalidatedTokenRepository extends JpaRepository<InvalidatedToken, String> {}