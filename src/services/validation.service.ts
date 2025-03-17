import { Injectable } from '@angular/core';
import {HttpService} from './http.service';
import {AbstractControl, AsyncValidatorFn, ValidationErrors} from '@angular/forms';
import {map, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  constructor(private http:HttpService) { }

  validationUsername():AsyncValidatorFn{
    return (control: AbstractControl):Observable<ValidationErrors | null> => {
      return this.http.checkUsername(control.value).pipe(
        map((res: boolean) => {
          if (res) {
            return {checkUsername: true}
          } else {
            return null;
          }
        })
      );
    }
  }

  validationEmail(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      return this.http.checkEmail(control.value).pipe(
        map((res: boolean) => {
          if (res) {
            return {checkEmail: true}
          } else {
            return null;
          }
        })
      )
    }
  }


}
