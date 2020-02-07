import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RouteComponent } from './route/route.component';
import { CmapComponent } from './cmap/cmap.component';
import { MergeComponent } from './merge/merge.component';



const routes: Routes = [
  { path:  'route', component:  RouteComponent},
  { path:  'cmap', component:  CmapComponent},
  { path:  'merge', component:  MergeComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
