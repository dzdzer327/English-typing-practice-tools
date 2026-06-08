package com.typing.backend.repository;

import com.typing.backend.entity.UserSentencePractice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserSentencePracticeRepository extends JpaRepository<UserSentencePractice, Long> {

    Optional<UserSentencePractice> findByUserIdAndSentenceHash(Long userId, String sentenceHash);

    List<UserSentencePractice> findByUserId(Long userId);

    @Query("SELECT u.sentenceHash FROM UserSentencePractice u WHERE u.user.id = :userId AND u.practiceCount >= :maxCount")
    List<String> findMasteredSentences(@Param("userId") Long userId, @Param("maxCount") int maxCount);

    @Query("SELECT u.sentenceHash FROM UserSentencePractice u WHERE u.user.id = :userId ORDER BY u.practiceCount ASC")
    List<String> findSentencesOrderByPracticeCount(@Param("userId") Long userId);
}
