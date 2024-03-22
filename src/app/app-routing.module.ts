import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FlightTrackerDashboardComponent } from './flight-tracker-dashboard/flight-tracker-dashboard.component';

const routes: Routes = [
  {
    path: '',
    title: 'Dashboard',
    component: FlightTrackerDashboardComponent,
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    title: 'Dashboard',
    component: FlightTrackerDashboardComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
