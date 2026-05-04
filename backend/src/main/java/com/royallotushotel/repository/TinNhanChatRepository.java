package com.royallotushotel.repository;

import com.royallotushotel.entity.TinNhanChat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TinNhanChatRepository extends JpaRepository<TinNhanChat, Long> {

    List<TinNhanChat> findByCuocTroChuyen_IdOrderByThoiDiemAsc(Long idCuocTroChuyen);
}
