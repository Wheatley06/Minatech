package com.minatech.iot.repository;

import com.minatech.iot.domain.LecturaTelemetria;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LecturaTelemetriaRepository extends JpaRepository<LecturaTelemetria, Long> {

    List<LecturaTelemetria> findBySensorMinaId(Long sensorMinaId);

    List<LecturaTelemetria> findBySensorMinaIdAndFechaHoraBetween(
            Long sensorMinaId, LocalDateTime desde, LocalDateTime hasta);

    /** Última lectura de cada sensor, para pintar el dashboard general. */
    List<LecturaTelemetria> findTop1BySensorMinaIdOrderByFechaHoraDesc(Long sensorMinaId);
}
