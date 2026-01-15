package com.example.bookland_be.repository;

import java.util.Optional;

import com.example.bookland_be.entity.User;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface UserRepository extends CrudRepository<User, Long>{

    // Cái Deriver query này phải khai báo ở đây trước thì service mới xài đc thì phải
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
}