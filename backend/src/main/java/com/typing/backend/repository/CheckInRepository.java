package com.typing.backend.repository;

import com.typing.backend.entity.CheckIn;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface CheckInRepository extends JpaRepository<CheckIn, Long> {

    Optional<CheckIn> findByUserIdAndCheckinDate(Long userId, LocalDate date);

    boolean existsByUserIdAndCheckinDate(Long userId, LocalDate date);

    List<CheckIn> findByUserIdOrderByCheckinDateDesc(Long userId);

    List<CheckIn> findByUserIdAndCheckinDateBetweenOrderByCheckinDateDesc(
            Long userId, LocalDate start, LocalDate end);

    Optional<CheckIn> findTopByUserIdOrderByCheckinDateDesc(Long userId);
}
