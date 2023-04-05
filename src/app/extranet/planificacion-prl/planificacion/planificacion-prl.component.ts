import { Component, OnInit } from "@angular/core";
import { MatTabChangeEvent } from "@angular/material/tabs";
import { SchedulingsService } from "../../../services/schedulings.service";

@Component({
  selector: "app-planificacion-prl",
  templateUrl: "./planificacion-prl.component.html",
  styleUrls: ["./planificacion-prl.component.css"],
})
export class PlanificacionPrlComponent implements OnInit {
  constructor(private schedulingsService: SchedulingsService) {}
  // Variables
  selected = 0;
  scheduleList = [];

  ngOnInit(): void {
    // Check url and change selected
    if (window.location.href.includes("planificacion-prl/planificacion")) {
      this.selected = 0;
    } else if (window.location.href.includes("planificacion-prl/historico")) {
      this.selected = 1;
    } else if (window.location.href.includes("planificacion-prl/objetivos")) {
      this.selected = 2;
    } else {
      this.selected = 0;
    }
  }

  // Methods
  changeSelected(event: MatTabChangeEvent) {
    if (event.index === 0) {
      window.history.pushState(
        {},
        "",
        "/extranet/planificacion-prl/planificacion"
      );
    } else if (event.index === 1) {
      window.history.pushState({}, "", "/extranet/planificacion-prl/historico");
    } else if (event.index === 2) {
      window.history.pushState({}, "", "/extranet/planificacion-prl/objetivos");
    }
  }
}
