package com.example.backend.foodItems;

import jakarta.transaction.Transactional;

import java.util.Date;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface FoodItemRepository extends JpaRepository<FoodItems, Long> {
  @Query("SELECT f FROM FoodItems f WHERE f.quantity > 0")
  List<FoodItems> findAllWithNonZeroQuantity();

  @Query(
    "SELECT f FROM FoodItems f WHERE f.donorId = :donorId AND f.quantity > 0"
  )
  List<FoodItems> findByDonorId(Long donorId);

  @Query(
    value = "SELECT * FROM food_items WHERE " +
    "ST_DWithin(" +
    "   ST_SetSRID(ST_MakePoint(pickup_longitude, pickup_latitude), 4326)::geography, " +
    "   ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, " +
    "   :distance * 1000" +
    ")",
    nativeQuery = true
  )
  List<FoodItems> findItemsWithinDistance(
    @Param("lat") double lat,
    @Param("lng") double lng,
    @Param("distance") int distance
  );

  @Modifying
  @Transactional
  @Query(
    "UPDATE FoodItems f SET f.quantity = f.quantity - :quantity WHERE f.id = :id"
  )
  int reduceQuantityById(@Param("id") Long id, @Param("quantity") int quantity);

  @Modifying
  @Transactional
  @Query(
    "UPDATE FoodItems f SET f.quantity = f.quantity + :quantity WHERE f.id = :id"
  )
  int increaseQuantityById(
    @Param("id") Long id,
    @Param("quantity") int quantity
  );

  @Modifying
  @Transactional
  @Query("DELETE FROM FoodItems f WHERE f.id = :id AND f.quantity = 0")
  int deleteIfZeroQuantity(@Param("id") Long id);

  @Query("SELECT f FROM FoodItems f WHERE f.expiryDate < :currentDate")
  List<FoodItems> findByExpiryDateBefore(
    @Param("currentDate") Date currentDate
  );

  @Modifying
  @Transactional
  @Query("DELETE FROM FoodItems f WHERE f.expiryDate < :currentDate")
  void deleteByExpiryDateBefore(@Param("currentDate") Date currentDate);
}
