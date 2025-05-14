import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse, HttpResponse, HttpStatusCode } from "@angular/common/http";
import { IUserReg } from "../interfaces/user-auth/i-user-reg";
import { catchError, map, Observable, of } from "rxjs";
import { IUserLogin } from "../interfaces/user-auth/i-user-login";
import { IError } from "../interfaces/i-error";
import { AuthService } from "./auth.service";
import { JWTResponse } from "../interfaces/user-auth/jwtresponse";
import { ITokenData } from "../interfaces/user-auth/i-token-data";
import { IUserStartData } from "../interfaces/user-auth/i-user-start-data";
import { IUser } from "../interfaces/i-user";
import { IRole } from "../interfaces/i-role";
import { INewUser } from "../interfaces/i-new-user";
import { INewRole } from "../interfaces/i-new-role";
import { IUserInfo } from "../interfaces/user-auth/i-user-info";
import { IClimateEntity } from "../interfaces/country-block/i-climate.entity";
import { ErrorMessage } from "../models/error-message";
import { ILanguageEntity } from "../interfaces/country-block/i-language.entity";
import { ICountryEntity } from "../interfaces/country-block/i-country.entity";
import { IMainCountryForCityEntity } from "../interfaces/country-block/i-main-country-for-city.entity";
import { ICityEntity } from "../interfaces/country-block/i-city.entity";
import { IBlobImageEntity } from "../interfaces/country-block/i-blob-image.entity";
import { IFromToEntity } from "../interfaces/filters-block/i-from-to.entity";
import { IFromCountryEntity } from "../interfaces/filters-block/i-from-country.entity";

@Injectable({
	providedIn: "root"
})
export class HttpService {
	private readonly baseUrl: string;
	private readonly errorDefaultMessage: string[];

	constructor(private http: HttpClient, private authService: AuthService) {
		this.baseUrl = "http://localhost:8080";
		this.errorDefaultMessage = [
			"An unexpected error occurred while adding",
			"An unexpected error occurred during the update",
			"An unexpected error occurred during deletion",
			"Delete failed"
		];
	}

	registrationUser(user: IUserReg): Observable<boolean | IError> {
		return this.http.post(`${this.baseUrl}/registration`, user, { observe: "response" }).pipe(
			map(response => {
				return response.status === 200;
			}),
			catchError((error: HttpErrorResponse) =>
				of(this.getErrorMessage(error, "User with that name or email already exists"))
			)
		);
	}

	loginUser(user: IUserLogin): Observable<IUserStartData | IError | null> {
		return this.http.post<any>(this.baseUrl + "/login", user, { observe: "response" }).pipe(
			map((response: HttpResponse<any>): IUserStartData | IError | null => {
				if (response.status === 200) {
					const jwtResponse: JWTResponse = {
						token: response.body.token
					};
					this.authService.setToken(jwtResponse.token);
					const data: ITokenData | null = this.authService.getDecodeToken();
					if (data != null) {
						return {
							roles: data.roles,
							username: data.sub
						} as IUserStartData;
					}
					return null;
				} else {
					return response.body.body as IError;
				}
			}),
			catchError((error: HttpErrorResponse) => of(this.getErrorMessage(error, "Authorization error")))
		);
	}

	// loading block // ------------------------------------------------------------
	loadingAllUsers(): Observable<IUser[] | IError> {
		return this.http.get<Object>(`${this.baseUrl}/all-users`, { observe: "response" }).pipe(
			map((response: HttpResponse<Object>): IUser[] | IError => {
				if (response.status === 200) {
					return response.body as IUser[];
				} else {
					return response.body as IError;
				}
			}),
			catchError((error: HttpErrorResponse) => of(this.getErrorMessage(error, error.message)))
		);
	}

	loadingAllRoles(): Observable<IRole[] | IError> {
		return this.http.get<Object>(`${this.baseUrl}/all-roles`, { observe: "response" }).pipe(
			map((response: HttpResponse<Object>): IRole[] | IError => {
				if (response.status === 200) {
					return response.body as IRole[];
				} else {
					return response.body as IError;
				}
			}),
			catchError((error: HttpErrorResponse) => of(this.getErrorMessage(error, error.message)))
		);
	}

	loadingAllClimate(): Observable<IClimateEntity[] | IError> {
		return this.http.get<Object>(`${this.baseUrl}/api/climates`, { observe: "response" }).pipe(
			map((response: HttpResponse<Object>): IClimateEntity[] | IError => {
				if (response.status === 200) {
					return response.body as IClimateEntity[];
				} else {
					return new ErrorMessage(HttpStatusCode.NoContent, "The list is empty");
				}
			}),
			catchError((error: HttpErrorResponse) => of(this.getErrorMessage(error, error.message)))
		);
	}

	loadingAllLanguage(): Observable<ILanguageEntity[] | IError> {
		return this.http.get<Object>(`${this.baseUrl}/api/languages`, { observe: "response" }).pipe(
			map((response: HttpResponse<Object>): ILanguageEntity[] | IError => {
				if (response.status === 200) {
					return response.body as ILanguageEntity[];
				} else {
					return new ErrorMessage(HttpStatusCode.NoContent, "The list is empty");
				}
			}),
			catchError((error: HttpErrorResponse) => {
				return of(this.getErrorMessage(error, error.message));
			})
		);
	}

	loadingUserById(id: number): Observable<IUser | IError> {
		return this.http.get<Object>(`${this.baseUrl}/user-get-id/${id}`, { observe: "response" }).pipe(
			map((response: HttpResponse<Object>): IUser | IError => {
				if (response.status === 200) {
					return response.body as IUser;
				} else {
					return response.body as IError;
				}
			}),
			catchError((error: HttpErrorResponse) => of(this.getErrorMessage(error, error.message)))
		);
	}

	loadingClimateById(id: number): Observable<IClimateEntity | IError> {
		return this.http.get<Object>(`${this.baseUrl}/api/climate/${id}`, { observe: "response" }).pipe(
			map((response: HttpResponse<Object>): IClimateEntity | IError => {
				if (response.status === 200) {
					return response.body as IClimateEntity;
				} else {
					return new ErrorMessage(HttpStatusCode.NotFound, "User not found");
				}
			}),
			catchError((error: HttpErrorResponse) => of(this.getErrorMessage(error, "Error loading climate")))
		);
	}

	loadingUserByUsername(username: string): Observable<IUserInfo | IError> {
		return this.http
			.get<Object>(`${this.baseUrl}/user-get-username/${username}`, {
				observe: "response"
			})
			.pipe(
				map((response: HttpResponse<Object>): IUserInfo | IError => {
					if (response.status === 200) {
						return response.body as IUserInfo;
					} else {
						return response.body as IError;
					}
				}),
				catchError(
					(error: HttpErrorResponse): Observable<IError> =>
						of(this.getErrorMessage(error, "Error loading user by username"))
				)
			);
	}

	loadingAllCountryByAdmin(): Observable<ICountryEntity[] | IError> {
		return this.http
			.get<Object>(`${this.baseUrl}/api/countries/admin`, {
				observe: "response"
			})
			.pipe(
				map((response: HttpResponse<Object>): ICountryEntity[] | IError => {
					if (response.status === 200) {
						return response.body as ICountryEntity[];
					} else {
						return new ErrorMessage(HttpStatusCode.NoContent, "Data is temporarily unavailable");
					}
				}),
				catchError((error: HttpErrorResponse) => of(this.getErrorMessage(error, "Error loading countries data")))
			);
	}

	loadingCountryById(id: number): Observable<ICountryEntity | IError> {
		return this.http
			.get<Object>(`${this.baseUrl}/api/countries/${id}`, {
				observe: "response"
			})
			.pipe(
				map((response: HttpResponse<Object>): ICountryEntity | IError => {
					if (response.status === 200) {
						return response.body as ICountryEntity;
					} else {
						return new ErrorMessage(response.status, `Unable to load country with ID ${id}`);
					}
				}),
				catchError((error: HttpErrorResponse) =>
					of(this.getErrorMessage(error, "An error occurred while loading data from the server"))
				)
			);
	}

	loadingAllAdminCities(): Observable<ICityEntity<IMainCountryForCityEntity, IBlobImageEntity>[] | IError> {
		return this.http.get<Object>(`${this.baseUrl}/admin-cities`, { observe: "response" }).pipe(
			map((response: HttpResponse<Object>): ICityEntity<IMainCountryForCityEntity, IBlobImageEntity>[] | IError => {
				if (response.status === 200) {
					return response.body as ICityEntity<IMainCountryForCityEntity, IBlobImageEntity>[];
				} else {
					return response.body as IError;
				}
			}),
			catchError((error: HttpErrorResponse): Observable<IError> => {
				return of(this.getErrorMessage(error, "Data loading error"));
			})
		);
	}

	loadingAllFromToEntities(): Observable<IFromToEntity[] | IError> {
		return this.http.get<Object>(`${this.baseUrl}/from-to/all`, { observe: "response" }).pipe(
			map((response: HttpResponse<Object>): IFromToEntity[] | IError => {
				if (response.status === HttpStatusCode.Ok) {
					return response.body as IFromToEntity[];
				} else {
					return response.body as IError;
				}
			}),
			catchError((error: HttpErrorResponse): Observable<IError> => {
				return of(this.getErrorMessage(error, "Data loading error"));
			})
		);
	}

	loadingAllFomToCountries(): Observable<IFromCountryEntity[] | IError> {
		return this.http.get<Object>(`${this.baseUrl}/api/countries/from-to`, { observe: "response" }).pipe(
			map((response: HttpResponse<Object>): IFromCountryEntity[] | IError => {
				if (response.status === HttpStatusCode.Ok) {
					return response.body as IFromCountryEntity[];
				} else {
					return response.body as IError;
				}
			}),
			catchError(
				(error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, "Data loading error"))
			)
		);
	}

	// block adding // ------------------------------------------------------------
	addUser(user: INewUser): Observable<IUser | IError> {
		return this.http.post(`${this.baseUrl}/add-user`, user, { observe: "response" }).pipe(
			map((resp: HttpResponse<object>): IUser | IError => {
				if (resp.status === 200) {
					return resp.body as IUser;
				} else {
					return resp.body as IError;
				}
			}),
			catchError(
				(error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, this.errorDefaultMessage[0]))
			)
		);
	}

	addRole(role: INewRole): Observable<IRole | IError> {
		return this.http.post(`${this.baseUrl}/add-role`, role, { observe: "response" }).pipe(
			map((response: HttpResponse<Object>): IRole | IError => {
				if (response.status === 200) {
					return response.body as IRole;
				} else {
					return response.body as IError;
				}
			}),
			catchError(
				(error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, this.errorDefaultMessage[0]))
			)
		);
	}

	addClimate(climate: IClimateEntity): Observable<IClimateEntity | IError> {
		return this.http
			.post(`${this.baseUrl}/api/climates/create`, climate, {
				observe: "response"
			})
			.pipe(
				map((response: HttpResponse<Object>): IClimateEntity | IError => {
					if (response.status === HttpStatusCode.Created) {
						return response.body as IClimateEntity;
					} else {
						return new ErrorMessage(response.status, "Error adding climate");
					}
				}),
				catchError(
					(error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, this.errorDefaultMessage[0]))
				)
			);
	}

	addLanguage(language: ILanguageEntity): Observable<ILanguageEntity | IError> {
		return this.http
			.post(`${this.baseUrl}/api/languages/create`, language, {
				observe: "response"
			})
			.pipe(
				map((response: HttpResponse<Object>): ILanguageEntity | IError => {
					if (response.status === HttpStatusCode.Created) {
						return response.body as ILanguageEntity;
					} else {
						return new ErrorMessage(response.status, "Error adding language");
					}
				}),
				catchError(
					(response: HttpErrorResponse): Observable<IError> =>
						of(this.getErrorMessage(response, this.errorDefaultMessage[0]))
				)
			);
	}

	addCountry(country: FormData): Observable<ICountryEntity | IError> {
		return this.http
			.post(`${this.baseUrl}/api/countries/create`, country, {
				observe: "response"
			})
			.pipe(
				map((response: HttpResponse<Object>): ICountryEntity | IError => {
					if (response.status === HttpStatusCode.Created) {
						return response.body as ICountryEntity;
					} else {
						return new ErrorMessage(HttpStatusCode.BadRequest, "Country creation error");
					}
				}),
				catchError((error: HttpErrorResponse) => of(this.getErrorMessage(error, this.errorDefaultMessage[0])))
			);
	}

	addCity(city: FormData): Observable<ICityEntity<IMainCountryForCityEntity, IBlobImageEntity> | IError> {
		return this.http.post(`${this.baseUrl}/city-create`, city, { observe: "response" }).pipe(
			map((response: HttpResponse<Object>): ICityEntity<IMainCountryForCityEntity, IBlobImageEntity> | IError => {
				if (response.status === HttpStatusCode.Created) {
					return response.body as ICityEntity<IMainCountryForCityEntity, IBlobImageEntity>;
				} else {
					return response.body as IError;
				}
			}),
			catchError(
				(error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, this.errorDefaultMessage[0]))
			)
		);
	}

	addFromToEntity(fromTo: IFromToEntity): Observable<IFromToEntity | IError> {
		return this.http.post(`${this.baseUrl}/from-to/create`, fromTo, { observe: "response" }).pipe(
			map((response: HttpResponse<Object>): IFromToEntity | IError => {
				if (response.status === HttpStatusCode.Created) {
					return response.body as IFromToEntity;
				} else {
					return response.body as IError;
				}
			}),
			catchError(
				(error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, this.errorDefaultMessage[0]))
			)
		);
	}

	// block update // ------------------------------------------------------------
	updateUser(user: IUser): Observable<boolean | IError> {
		return this.http.post(`${this.baseUrl}/update-user`, user, { observe: "response" }).pipe(
			map((resp: HttpResponse<object>): boolean | IError => {
				if (resp.status === 200) {
					return true;
				} else {
					return resp.body as IError;
				}
			}),
			catchError(
				(error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, this.errorDefaultMessage[1]))
			)
		);
	}

	updateUserInfo(user: IUserInfo): Observable<IUserInfo | IError> {
		return this.http.post(`${this.baseUrl}/update-user-info`, user, { observe: "response" }).pipe(
			map((resp: HttpResponse<object>): IUserInfo | IError => {
				if (resp.status === 200) {
					return resp.body as IUserInfo;
				} else {
					return resp.body as IError;
				}
			}),
			catchError(
				(error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, this.errorDefaultMessage[1]))
			)
		);
	}

	updateCountry(country: FormData): Observable<ICountryEntity | IError> {
		return this.http
			.put(`${this.baseUrl}/api/countries/update`, country, {
				observe: "response"
			})
			.pipe(
				map((response: HttpResponse<Object>): ICountryEntity | IError => {
					if (response.status === 200) {
						return response.body as ICountryEntity;
					} else {
						return response.body as IError;
					}
				}),
				catchError((error: HttpErrorResponse) => of(this.getErrorMessage(error, this.errorDefaultMessage[1])))
			);
	}

	updateCity(city: FormData): Observable<ICityEntity<IMainCountryForCityEntity, IBlobImageEntity> | IError> {
		return this.http.put(`${this.baseUrl}/city-update`, city, { observe: "response" }).pipe(
			map((response: HttpResponse<Object>): ICityEntity<IMainCountryForCityEntity, IBlobImageEntity> | IError => {
				if (response.status === HttpStatusCode.Ok) {
					return response.body as ICityEntity<IMainCountryForCityEntity, IBlobImageEntity>;
				} else {
					return response.body as IError;
				}
			}),
			catchError(
				(error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, this.errorDefaultMessage[1]))
			)
		);
	}

	updateFromToEntity(fromTo: IFromToEntity): Observable<IFromToEntity | IError> {
		return this.http.put(`${this.baseUrl}/from-to/edit`, fromTo, { observe: "response" }).pipe(
			map((response: HttpResponse<Object>): IFromToEntity | IError => {
				if (response.status === HttpStatusCode.Ok) {
					return response.body as IFromToEntity;
				} else {
					return response.body as IError;
				}
			}),
			catchError(
				(error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, this.errorDefaultMessage[1]))
			)
		);
	}

	//delete block // ------------------------------------------------------------
	deleteUser(id: number): Observable<boolean | IError> {
		return this.http.delete(`${this.baseUrl}/delete-user/${id}`, { observe: "response" }).pipe(
			map((response: HttpResponse<Object>): boolean | IError => {
				if (response.status === 200) {
					return true;
				} else {
					return response.body as IError;
				}
			}),
			catchError(
				(error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, this.errorDefaultMessage[2]))
			)
		);
	}

	deleteRole(id: number): Observable<boolean | IError> {
		return this.http.delete(`${this.baseUrl}/delete-role/${id}`, { observe: "response" }).pipe(
			map((response: HttpResponse<Object>): boolean | IError => {
				if (response.status === 200) {
					return true;
				} else {
					return response.body as IError;
				}
			}),
			catchError(
				(error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, this.errorDefaultMessage[2]))
			)
		);
	}

	deleteClimate(id: number): Observable<boolean | IError> {
		return this.http
			.delete(`${this.baseUrl}/api/climates/remove/${id}`, {
				observe: "response"
			})
			.pipe(
				map((response: HttpResponse<Object>): boolean | IError => {
					if (response.status === 200) {
						return true;
					} else {
						return new ErrorMessage(HttpStatusCode.NotFound, this.errorDefaultMessage[3]);
					}
				}),
				catchError(
					(error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, this.errorDefaultMessage[2]))
				)
			);
	}

	deleteLanguage(id: number): Observable<boolean | IError> {
		return this.http
			.delete(`${this.baseUrl}/api/languages/remove/${id}`, {
				observe: "response"
			})
			.pipe(
				map((response: HttpResponse<Object>): boolean | IError => {
					if (response.status === 200) {
						return true;
					} else {
						return new ErrorMessage(HttpStatusCode.NotFound, this.errorDefaultMessage[3]);
					}
				}),
				catchError(
					(error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, this.errorDefaultMessage[2]))
				)
			);
	}

	deleteCountry(id: number): Observable<boolean | IError> {
		return this.http
			.delete(`${this.baseUrl}/api/countries/remove/${id}`, {
				observe: "response"
			})
			.pipe(
				map((response: HttpResponse<Object>) => {
					if (response.status === 200) {
						return true;
					} else {
						return new ErrorMessage(HttpStatusCode.BadRequest, this.errorDefaultMessage[3]);
					}
				}),
				catchError((error: HttpErrorResponse) => of(this.getErrorMessage(error, this.errorDefaultMessage[2])))
			);
	}

	deleteCity(id: number): Observable<boolean | IError> {
		return this.http.delete(`${this.baseUrl}/city/remove/${id}`, { observe: "response" }).pipe(
			map((response: HttpResponse<Object>): boolean | IError => {
				if (response.status === HttpStatusCode.NoContent) {
					return true;
				} else {
					return new ErrorMessage(HttpStatusCode.BadRequest, this.errorDefaultMessage[3]);
				}
			}),
			catchError((error: HttpErrorResponse) => of(this.getErrorMessage(error, this.errorDefaultMessage[2])))
		);
	}

	deleteFormToEntity(id: number): Observable<boolean | IError> {
		return this.http.delete(`${this.baseUrl}/from-to/remove/${id}`, { observe: "response" }).pipe(
			map((response: HttpResponse<Object>): boolean | IError => {
				if (response.status === HttpStatusCode.Ok) {
					return true;
				} else {
					return response.body as IError;
				}
			}),
			catchError(
				(error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, this.errorDefaultMessage[2]))
			)
		);
	}

	// other methods block// ------------------------------------------------------------
	checkUsername(username: string): Observable<boolean> {
		return this.http
			.get(`${this.baseUrl}/check-username/${username}`, {
				observe: "response"
			})
			.pipe(
				map((response: HttpResponse<object>): boolean => {
					return response.status === 200;
				})
			);
	}

	private getErrorMessage(error: HttpErrorResponse, message: string): IError {
		const errorBody = error.error?.body;

		return new ErrorMessage(errorBody?.status || error.status, errorBody?.message || message);
	}
}
