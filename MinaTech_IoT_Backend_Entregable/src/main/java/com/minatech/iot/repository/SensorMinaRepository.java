package com.minatech.iot.repository;

import com.minatech.iot.domain.EstadoSensor;
import com.minatech.iot.domain.SensorMina;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SensorMinaRepository extends JpaRepository<SensorMina, Long> {

    List<SensorMina> findByEstado(EstadoSensor estado);

    List<SensorMina> findByEquipoMecanicoId(Long equipoMecanicoId);

    /** Usado por el listener MQTT para ubicar el sensor de cada variable de un equipo. */
    Optional<SensorMina> findByEquipoMecanicoIdAndClaveVariable(Long equipoMecanicoId, String claveVariable);
}
