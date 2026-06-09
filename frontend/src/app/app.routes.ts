import { Routes } from '@angular/router';
import { privateGuard, publicGuard } from './auth/data-access/guards/auth.guard';

export const routes: Routes = [
    {
        path: 'auth',
        canActivate:[publicGuard],
        loadChildren: () => import('./auth/features/auth-shell/auth-routing'),
    },
    {
        path: '',
        canActivate: [privateGuard],
        loadChildren: () => import('./views/features/view-shell/view-routing')
    }
];
