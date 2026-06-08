package com.typing.backend.repository;

import com.typing.backend.entity.UserWordPractice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserWordPracticeRepository extends JpaRepository<UserWordPractice, Long> {

    Optional<UserWordPractice> findByUserIdAndWord(Long userId, String word);

    List<UserWordPractice> findByUserId(Long userId);

    @Query("SELECT u.word FROM UserWordPractice u WHERE u.user.id = :userId AND u.practiceCount >= :maxCount")
    List<String> findMasteredWords(@Param("userId") Long userId, @Param("maxCount") int maxCount);

    @Query("SELECT u.word FROM UserWordPractice u WHERE u.user.id = :userId ORDER BY u.practiceCount ASC")
    List<String> findWordsOrderByPracticeCount(@Param("userId") Long userId);
}
