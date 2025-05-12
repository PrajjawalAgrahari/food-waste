package com.example.backend.Matchmaking;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PickupRequestRepository
  extends JpaRepository<PickupRequest, Long> {
  List<PickupRequest> findByDeliveryNumber(String deliveryNumber);
  List<PickupRequest> findByDonorId(Long donorId);
  List<PickupRequest> findByReceiverId(Long receiverId);
}
