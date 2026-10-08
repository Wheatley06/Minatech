package com.minatech.iot.repository;

import com.minatech.iot.domain.AlertaRiesgo;
import com.minatech.iot.domain.NivelRiesgo;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AlertaRiesgoRepository extends JpaRepository<AlertaRiesgo, Long> {

    List<AlertaRiesgo> findByAtendida(boolean atendida);

    List<AlertaRiesgo> findByNivelRiesgo(NivelRiesgo nivelRiesgo);

    List<AlertaRiesgo> findByFechaGeneracionBetween(LocalDateTime desde, LocalDateTime hasta);

    List<AlertaRiesgo> findByLecturaTelemetria_SensorMina_Id(Long sensorMinaId);
}
