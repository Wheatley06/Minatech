package com.minatech.iot.dashboard;

import com.minatech.iot.dashboard.dto.LecturaDashboardResponse;
import com.minatech.iot.domain.LecturaTelemetria;
import com.minatech.iot.domain.SensorMina;
import com.minatech.iot.repository.LecturaTelemetriaRepository;
import com.minatech.iot.repository.SensorMinaRepository;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Respalda la pantalla "Dashboard general": una fila por cada sensor
 * registrado con su ultima lectura conocida (vibracion 1/2, gas 1/2,
 * presion 1/2, temperatura 1/2, segun los sensores que existan).
 */
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final SensorMinaRepository sensorMinaRepository;
    private final LecturaTelemetriaRepository lecturaTelemetriaRepository;

    public DashboardController(SensorMinaRepository sensorMinaRepository,
                                LecturaTelemetriaRepository lecturaTelemetriaRepository) {
        this.sensorMinaRepository = sensorMinaRepository;
        this.lecturaTelemetriaRepository = lecturaTelemetriaRepository;
    }

    @GetMapping
    public ResponseEntity<List<LecturaDashboardResponse>> ultimasLecturas() {
        List<SensorMina> sensores = sensorMinaRepository.findAll();

        List<LecturaDashboardResponse> respuesta = sensores.stream()
                .map(sensor -> {
                    List<LecturaTelemetria> ultima =
                            lecturaTelemetriaRepository.findTop1BySensorMinaIdOrderByFechaHoraDesc(sensor.getId());
                    return ultima.isEmpty()
                            ? LecturaDashboardResponse.sinLecturas(sensor)
                            : LecturaDashboardResponse.desde(sensor, ultima.get(0));
                })
                .toList();

        return ResponseEntity.ok(respuesta);
    }
}
