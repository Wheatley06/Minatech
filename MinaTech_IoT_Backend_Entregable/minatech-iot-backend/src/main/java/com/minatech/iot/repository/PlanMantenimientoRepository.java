package com.minatech.iot.repository;

import com.minatech.iot.domain.EstadoPlanMantenimiento;
import com.minatech.iot.domain.PlanMantenimiento;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlanMantenimientoRepository extends JpaRepository<PlanMantenimiento, Long> {

    List<PlanMantenimiento> findByEquipoMecanicoId(Long equipoMecanicoId);

    List<PlanMantenimiento> findByEstado(EstadoPlanMantenimiento estado);
}
