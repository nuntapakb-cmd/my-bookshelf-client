import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';


import { NavbarComponent } from './navbar.component';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';


describe('NavbarComponent', () => {
 let component: NavbarComponent;
 let fixture: ComponentFixture<NavbarComponent>;


 // simple stubs for services
 const authStub = {
   logout: jasmine.createSpy('logout')
 };
 const themeStub = {
   toggle: jasmine.createSpy('toggle')
 };


 beforeEach(async () => {
   await TestBed.configureTestingModule({
     imports: [
       NavbarComponent,        // standalone component must be imported here
       RouterTestingModule     // use RouterTestingModule when testing routing-dependent components
     ],
     providers: [
       { provide: AuthService, useValue: authStub },
       { provide: ThemeService, useValue: themeStub }
     ]
   }).compileComponents();


   fixture = TestBed.createComponent(NavbarComponent);
   component = fixture.componentInstance;
   fixture.detectChanges();
 });


 it('should create', () => {
   expect(component).toBeTruthy();
 });


 it('should call auth.logout when logout is called', () => {
   component.logout();
   expect(authStub.logout).toHaveBeenCalled();
 });


 it('should call themeService.toggle when toggleTheme is called', () => {
   component.toggleTheme();
   expect(themeStub.toggle).toHaveBeenCalled();
 });
});
