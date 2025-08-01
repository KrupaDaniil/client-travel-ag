import {Injectable} from "@angular/core";
import {HttpClient, HttpErrorResponse, HttpParams, HttpResponse, HttpStatusCode} from "@angular/common/http";
import {IUserReg} from "../interfaces/user-auth/i-user-reg";
import {catchError, map, Observable, of} from "rxjs";

import {IUserLogin} from "../interfaces/user-auth/i-user-login";
import {IError} from "../interfaces/i-error";
import {AuthService} from "./auth.service";
import {JWTResponse} from "../interfaces/user-auth/jwtresponse";
import {ITokenData} from "../interfaces/user-auth/i-token-data";
import {IUserStartData} from "../interfaces/user-auth/i-user-start-data";
import {IUser} from "../interfaces/i-user";
import {IRole} from "../interfaces/i-role";
import {INewUser} from "../interfaces/i-new-user";
import {INewRole} from "../interfaces/i-new-role";
import {IUserInfo} from "../interfaces/user-auth/i-user-info";
import {IClimateEntity} from "../interfaces/country-block/i-climate.entity";
import {ErrorMessage} from "../models/error-message";
import {ILanguageEntity} from "../interfaces/country-block/i-language.entity";
import {ICountryEntity} from "../interfaces/country-block/i-country.entity";
import {IMainCountryForCityEntity} from "../interfaces/country-block/i-main-country-for-city.entity";
import {ICityEntity} from "../interfaces/country-block/i-city.entity";
import {IBlobImageEntity} from "../interfaces/country-block/i-blob-image.entity";
import {ILoginError} from "../interfaces/i-login-error";
import {IHotelEntity} from "../interfaces/hotels-block/i-hotel.entity";
import {ITagEntity} from "../interfaces/hotels-block/i-tag.entity";
import {IAdminHotelEntity} from "../interfaces/hotels-block/i-admin-hotel.entity";
import {IMinUser} from "../interfaces/i-min-user";
import {IMinCountryEntity} from "../interfaces/country-block/i-min-country.entity";
import {IMinCityEntity} from "../interfaces/country-block/i-min-city.entity";
import {IMinHotel} from "../interfaces/hotels-block/i-min-hotel";
import {IAdminRoomType} from "../interfaces/hotels-block/i-admin-room-type";
import {IAdminFoodType} from "../interfaces/hotels-block/i-admin-food-type";
import {IRoomTypeCreateEntity} from "../interfaces/hotels-block/i-room-type-create.entity";
import {IFoodTypeCreateEntity} from "../interfaces/hotels-block/i-food-type-create.entity";
import {IRoomUpdate} from "../interfaces/hotels-block/i-room-update";
import {IFoodUpdate} from "../interfaces/hotels-block/i-food-update";
import {IAdminTour} from "../interfaces/tour-block/i-admin-tour";
import {IHotelFeedbackEntity} from "../interfaces/hotels-block/i-hotel-feedback.entity";
import {IStatisticHotel} from "../interfaces/statistic-block/i-statistic-hotel";
import {IStatisticTour} from "../interfaces/statistic-block/i-statistic-tour";
import {IHotelRatesEntity} from "../interfaces/hotels-block/i-hotel-rates.entity";
import {ICardTour} from "../interfaces/tour-block/i-card-tour";
import {ITourDetail} from "../interfaces/tour-block/i-tour-detail";
import {IMinCityCountryEntity} from "../interfaces/country-block/i-min-city-country.entity";
import {IOrderTour} from "../interfaces/tour-block/i-order-tour";
import {ICreateOrderTour} from "../interfaces/tour-block/i-create-order-tour";
import {IOrderHotels} from "../interfaces/hotels-block/i-order-hotels";

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
            "Delete failed",
            "The list is empty"
        ];
    }

    registrationUser(user: IUserReg): Observable<boolean | IError> {
        return this.http.post(`${this.baseUrl}/registration`, user, {observe: "response"}).pipe(
            map(response => {
                return response.status === HttpStatusCode.Ok;
            }),
            catchError((error: HttpErrorResponse) =>
                of(this.getErrorMessage(error, "User with that name or email already exists"))
            )
        );
    }

    loginUser(user: IUserLogin): Observable<IUserStartData | ILoginError | IError> {
        return this.http.post(this.baseUrl + "/login", user, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): IUserStartData | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    const jwtResponse: JWTResponse = response.body as JWTResponse;

                    this.authService.setToken(jwtResponse.token);

                    const data: ITokenData | null = this.authService.getDecodeToken();
                    if (data != null) {
                        return {
                            roles: data.roles,
                            username: data.sub
                        } as IUserStartData;
                    }
                }

                return new ErrorMessage(HttpStatusCode.Conflict, "Token error");
            }),
            catchError((error: HttpErrorResponse): Observable<ILoginError | IError> => {
                if (error.status === HttpStatusCode.BadRequest) {
                    return of(error.error as ILoginError);
                }

                if (error.status === HttpStatusCode.Unauthorized || error.status === HttpStatusCode.InternalServerError) {
                    return of(error.error as IError);
                }

                return of(this.getErrorMessage(error, "Authorization error"));
            })
        );
    }

    // loading block // ------------------------------------------------------------
    loadingAllUsers(): Observable<IUser[] | IError> {
        return this.http.get<Object>(`${this.baseUrl}/all-users`, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): IUser[] | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return response.body as IUser[];
                } else {
                    return new ErrorMessage(HttpStatusCode.NoContent, this.errorDefaultMessage[4]);
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, "Failed to loading users"))
            )
        );
    }

    loadingAllManagers(roleId: number): Observable<IMinUser[] | IError> {
        return this.http.get(`${this.baseUrl}/users-get-roleId/${roleId}`, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): IMinUser[] | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return response.body as IMinUser[];
                } else {
                    return new ErrorMessage(HttpStatusCode.NoContent, this.errorDefaultMessage[4]);
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, "Could not load managers"))
            )
        );
    }

    loadingAllRoles(): Observable<IRole[] | IError> {
        return this.http.get<Object>(`${this.baseUrl}/all-roles`, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): IRole[] | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return response.body as IRole[];
                } else {
                    return new ErrorMessage(HttpStatusCode.NoContent, this.errorDefaultMessage[4]);
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, "Failed to loading roles"))
            )
        );
    }

    loadingRoleByName(name: string): Observable<IRole | IError> {
        return this.http.get(`${this.baseUrl}/role-name/${name}`, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): IRole | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return response.body as IRole;
                } else {
                    return new ErrorMessage(HttpStatusCode.BadRequest, "Failed to load role");
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, "Failed to loading role"))
            )
        );
    }

    loadingAllClimate(): Observable<IClimateEntity[] | IError> {
        return this.http.get<Object>(`${this.baseUrl}/api/climates`, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): IClimateEntity[] | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return response.body as IClimateEntity[];
                } else {
                    return new ErrorMessage(HttpStatusCode.NoContent, this.errorDefaultMessage[4]);
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, "Failed to loading climates"))
            )
        );
    }

    loadingAllLanguage(): Observable<ILanguageEntity[] | IError> {
        return this.http.get<Object>(`${this.baseUrl}/api/languages`, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): ILanguageEntity[] | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return response.body as ILanguageEntity[];
                } else {
                    return new ErrorMessage(HttpStatusCode.NoContent, this.errorDefaultMessage[4]);
                }
            }),
            catchError((error: HttpErrorResponse): Observable<IError> => {
                return of(this.getErrorMessage(error, "Failed to loading languages"));
            })
        );
    }

    loadingUserById(id: number): Observable<IUser | IError> {
        return this.http.get<Object>(`${this.baseUrl}/user-get-id/${id}`, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): IUser | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return response.body as IUser;
                } else {
                    return new ErrorMessage(HttpStatusCode.NotFound, "User not found");
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, "Failed to loading user"))
            )
        );
    }

    loadingUserByUsername(username: string): Observable<IUserInfo | IError> {
        return this.http.get<Object>(`${this.baseUrl}/user-get-username/${username}`, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): IUserInfo | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return response.body as IUserInfo;
                } else {
                    return new ErrorMessage(HttpStatusCode.NotFound, "User not found");
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> =>
                    of(this.getErrorMessage(error, "Error loading user by username"))
            )
        );
    }

    loadingMinUserByUsername(username: string): Observable<IMinUser | IError> {
        return this.http.get(`${this.baseUrl}/min-user-get-username/${username}`, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): IMinUser | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return response.body as IMinUser;
                } else {
                    return new ErrorMessage(HttpStatusCode.NotFound, "User not found");
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> =>
                    of(this.getErrorMessage(error, "Failed to retrieve data from the server"))
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
                    if (response.status === HttpStatusCode.Ok) {
                        return response.body as ICountryEntity[];
                    } else {
                        return new ErrorMessage(HttpStatusCode.NoContent, "Data is temporarily unavailable");
                    }
                }),
                catchError(
                    (error: HttpErrorResponse): Observable<IError> =>
                        of(this.getErrorMessage(error, "Error loading countries data"))
                )
            );
    }

    loadingAllMinCountry(): Observable<IMinCountryEntity[] | IError> {
        return this.http.get<Object>(`${this.baseUrl}/api/countries/admin/min-countries`, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): IMinCountryEntity[] | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return response.body as IMinCountryEntity[];
                } else {
                    return new ErrorMessage(HttpStatusCode.NoContent, this.errorDefaultMessage[4]);
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, "Failed to loading countries"))
            )
        );
    }

    loadingCountryById(id: number): Observable<ICountryEntity | IError> {
        return this.http
            .get<Object>(`${this.baseUrl}/api/countries/${id}`, {
                observe: "response"
            })
            .pipe(
                map((response: HttpResponse<Object>): ICountryEntity | IError => {
                    if (response.status === HttpStatusCode.Ok) {
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

    loadingMinCountryById(id: number): Observable<IMinCountryEntity | IError> {
        return this.http.get(`${this.baseUrl}/api/countries/${id}/admin`, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): IMinCountryEntity | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return response.body as IMinCountryEntity;
                } else {
                    return new ErrorMessage(response.status, `Unable to load country with ID ${id}`);
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> =>
                    of(this.getErrorMessage(error, "Error loading min countries data"))
            )
        );
    }

    loadingRateByHotelId(hotelId: number): Observable<IHotelRatesEntity | IError> {
        return this.http.get(`${this.baseUrl}/hotel/${hotelId}/ratings`, {observe: "response"}).pipe(
            map((resp: HttpResponse<Object>): IHotelRatesEntity | IError => {
                if (resp.status === HttpStatusCode.Ok) {
                    return resp.body as IHotelRatesEntity;
                } else {
                    return new ErrorMessage(HttpStatusCode.NoContent, this.errorDefaultMessage[0]);
                }
            }),
            catchError((error: HttpErrorResponse): Observable<IError> => {
                return of(this.getErrorMessage(error, "Data loading error"));
            })
        );
    }

    loadingAllAdminCities(): Observable<ICityEntity<IMainCountryForCityEntity, IBlobImageEntity>[] | IError> {
        return this.http.get<Object>(`${this.baseUrl}/admin-cities`, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): ICityEntity<IMainCountryForCityEntity, IBlobImageEntity>[] | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return response.body as ICityEntity<IMainCountryForCityEntity, IBlobImageEntity>[];
                } else {
                    return new ErrorMessage(HttpStatusCode.NoContent, this.errorDefaultMessage[4]);
                }
            }),
            catchError((error: HttpErrorResponse): Observable<IError> => {
                return of(this.getErrorMessage(error, "Data loading error"));
            })
        );
    }

    loadingAllCountryMinCities(id: number): Observable<IMinCityEntity[] | IError> {
        return this.http.get(`${this.baseUrl}/admin-cities/${id}`, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): IMinCityEntity[] | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return response.body as IMinCityEntity[];
                } else {
                    return new ErrorMessage(HttpStatusCode.NoContent, this.errorDefaultMessage[4]);
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> =>
                    of(this.getErrorMessage(error, "Error loading min cities data"))
            )
        );
    }

    loadingAllCountryFullCities(id: number): Observable<ICityEntity<IMainCountryForCityEntity, IBlobImageEntity>[] | IError> {
        return this.http.get(`${this.baseUrl}/cities/${id}`, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): ICityEntity<IMainCountryForCityEntity, IBlobImageEntity>[] | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return response.body as ICityEntity<IMainCountryForCityEntity, IBlobImageEntity>[];
                } else {
                    return new ErrorMessage(HttpStatusCode.NoContent, this.errorDefaultMessage[4]);
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> =>
                    of(this.getErrorMessage(error, "Error loading full cities data"))
            )
        );
    }

    loadingAllTags(): Observable<ITagEntity[] | IError> {
        return this.http.get<Object>(`${this.baseUrl}/hotel/tags`, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): ITagEntity[] | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return response.body as ITagEntity[];
                } else {
                    return new ErrorMessage(HttpStatusCode.NoContent, this.errorDefaultMessage[4]);
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, "Data loading error"))
            )
        );
    }

    loadingRandomHotelsByCountryId(countryId: number, amount: number): Observable<IHotelEntity[] | IError> {
        return this.http
            .get<Object>(`${this.baseUrl}/hotel/random/${countryId}?amount=${amount}`, {observe: "response"})
            .pipe(
                map((resp: HttpResponse<object>): IHotelEntity[] | IError => {
                    if (resp.status === 200) {
                        return resp.body as IHotelEntity[];
                    } else {
                        return resp.body as IError;
                    }
                }),
                catchError(
                    (error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, "Data loading error"))
                )
            );
    }

    loadingTopHotelsByCityId(cityId: number, amount: number): Observable<IHotelEntity[] | IError> {
        return this.http
            .get<Object>(`${this.baseUrl}/hotel/top/${cityId}?amount=${amount}`, {observe: "response"})
            .pipe(
                map((resp: HttpResponse<object>): IHotelEntity[] | IError => {
                    if (resp.status === 200) {
                        return resp.body as IHotelEntity[];
                    } else {
                        return resp.body as IError;
                    }
                }),
                catchError(
                    (error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, "Top Hotels loading error"))
                )
            );
    }

    loadingHotelsByCountryId(countryId: number): Observable<IHotelEntity[] | IError> {
        console.log(countryId);
        return this.http.get<Object>(`${this.baseUrl}/hotel/all/${countryId}`, {observe: "response"}).pipe(
            map((resp: HttpResponse<object>): IHotelEntity[] | IError => {
                if (resp.status === 200) {
                    return resp.body as IHotelEntity[];
                } else {
                    return new ErrorMessage(HttpStatusCode.NotFound, "Hotels not found");
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, "Data loading error"))
            )
        );
    }

    loadingAllHotelToAdmin(): Observable<IAdminHotelEntity[] | IError> {
        return this.http.get<Object>(`${this.baseUrl}/hotel/all-to-admin`, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): IAdminHotelEntity[] | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return response.body as IAdminHotelEntity[];
                } else {
                    return new ErrorMessage(response.status, "Failed to upload Hotels");
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, "Error loading Hotels"))
            )
        );
    }

    loadingAllHotelToAdminByIds(ids: number[]): Observable<IAdminHotelEntity[] | IError> {
        const params = new HttpParams().set('hotelIds', ids.join(','));

        return this.http.get<Object>(`${this.baseUrl}/hotel/all-to-admin/by-ids`, {
            observe: "response",
            params: params
        }).pipe(
            map((response: HttpResponse<Object>): IAdminHotelEntity[] | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return response.body as IAdminHotelEntity[];
                } else {
                    return new ErrorMessage(response.status, "Failed to upload Hotels");
                }
            }),
            catchError((error: HttpErrorResponse): Observable<IError> =>
                of(this.getErrorMessage(error, "Error loading Hotels"))
            )
        );
    }

    loadingAllMinCityCountries(): Observable<IMinCityCountryEntity[] | IError> {
        return this.http.get(`${this.baseUrl}/cities/min`, {observe: "response"}).pipe(
            map((resp: HttpResponse<Object>): IMinCityCountryEntity[] | IError => {
                if (resp.status === HttpStatusCode.Ok) {
                    return resp.body as IMinCityCountryEntity[];
                } else {
                    return new ErrorMessage(HttpStatusCode.NotFound, "Failed to upload cities");
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, "Data loading error"))
            )
        );
    }

    loadingHotelByIdToAdmin(hotelId: number): Observable<IAdminHotelEntity | IError> {
        return this.http.get(`${this.baseUrl}/hotel/admin/${hotelId}`, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): IAdminHotelEntity | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return response.body as IAdminHotelEntity;
                } else {
                    return new ErrorMessage(response.status, "Failed to load hotel");
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, "Error loading hotel"))
            )
        );
    }

    public loadingHotelById(hotelId: number, feedbacksAmount: number = 2) {
        return this.http
            .get<Object>(`${this.baseUrl}/hotel/${hotelId}?amount=${feedbacksAmount}`, {observe: "response"})
            .pipe(
                map((resp: HttpResponse<Object>): IHotelEntity | IError => {
                    if (resp.status === 200) {
                        return resp.body as IHotelEntity;
                    } else {
                        return new ErrorMessage(resp.status, "Hotel not found");
                    }
                }),
                catchError(
                    (error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, "Data loading error"))
                )
            );
    }

    public loadingAllMinHotel(): Observable<IMinHotel[] | IError> {
        return this.http.get(`${this.baseUrl}/hotel/all-to-min-hotel`, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): IMinHotel[] | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return response.body as IMinHotel[];
                } else {
                    return new ErrorMessage(HttpStatusCode.NoContent, this.errorDefaultMessage[4]);
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, "Error loading min hotel"))
            )
        );
    }

    public loadingAllMinHotelsByCityId(cityId: number): Observable<IMinHotel[] | IError> {
        return this.http.get(`${this.baseUrl}/hotel/all-to-city?cityId=${cityId}`, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): IMinHotel[] | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return response.body as IMinHotel[];
                } else {
                    return new ErrorMessage(HttpStatusCode.BadRequest, "Failed to load Hotels");
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, "Failed to load Hotels"))
            )
        );
    }

    public loadingAllRoomTypes(): Observable<IAdminRoomType[] | IError> {
        return this.http.get(`${this.baseUrl}/conveniences/rooms-admin`, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): IAdminRoomType[] | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return response.body as IAdminRoomType[];
                } else {
                    return new ErrorMessage(HttpStatusCode.NoContent, this.errorDefaultMessage[4]);
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, "Failed to load room types"))
            )
        );
    }

    public loadingAllFoodTypes(): Observable<IAdminFoodType[] | IError> {
        return this.http.get(`${this.baseUrl}/conveniences/food-admin`, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): IAdminFoodType[] | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return response.body as IAdminFoodType[];
                } else {
                    return new ErrorMessage(HttpStatusCode.NoContent, this.errorDefaultMessage[4]);
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, "Failed to load room types"))
            )
        );
    }

    public loadingAllFeedbacksByHotelId(hotelId: number): Observable<IHotelFeedbackEntity[] | IError> {
        return this.http.get<Object>(`${this.baseUrl}/hotel/${hotelId}/feedbacks`, {observe: "response"}).pipe(
            map((resp: HttpResponse<Object>): IHotelFeedbackEntity[] | IError => {
                if (resp.status === HttpStatusCode.Ok) {
                    return resp.body as IHotelFeedbackEntity[];
                } else {
                    return new ErrorMessage(HttpStatusCode.NoContent, this.errorDefaultMessage[4]);
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, "Failed to load room types"))
            )
        );
    }

    public loadingAllToursToAdmin(): Observable<IAdminTour[] | IError> {
        return this.http.get(`${this.baseUrl}/tours-admin`, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): IAdminTour[] | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return response.body as IAdminTour[];
                } else {
                    return new ErrorMessage(HttpStatusCode.NoContent, this.errorDefaultMessage[4]);
                }
            }),
            catchError((error: HttpErrorResponse): Observable<IError> => {
                return of(this.getErrorMessage(error, "Failed to load tours tour tours tour admin"));
            })
        );
    }

    public loadingAllToursToClient(): Observable<ICardTour[] | IError> {
        return this.http.get(`${this.baseUrl}/tours`, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): ICardTour[] | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return response.body as ICardTour[];
                } else {
                    return new ErrorMessage(HttpStatusCode.NoContent, this.errorDefaultMessage[4]);
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, "Error loading tours"))
            )
        );
    }


    public loadingDetailTourToClient(id: number): Observable<ITourDetail | IError> {
        return this.http.get(`${this.baseUrl}/client/tour/${id}`, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): ITourDetail | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return response.body as ITourDetail;
                } else {
                    return new ErrorMessage(HttpStatusCode.BadRequest, "Error loading tour details");
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> =>
                    of(this.getErrorMessage(error, "Server error loading tour details"))
            )
        );
    }

    public loadingAllHotelBooking(): Observable<IStatisticHotel[] | IError> {
        return this.http.get(`${this.baseUrl}/booking-hotels`, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): IStatisticHotel[] | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return response.body as IStatisticHotel[];
                } else {
                    return new ErrorMessage(HttpStatusCode.NoContent, this.errorDefaultMessage[4]);
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> =>
                    of(this.getErrorMessage(error, "Failed to load tours booking"))
            )
        );
    }

    public loadingAllTourBooking(): Observable<IStatisticTour[] | IError> {
        return this.http.get(`${this.baseUrl}/booking-tours`, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): IStatisticTour[] | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return response.body as IStatisticTour[];
                } else {
                    return new ErrorMessage(HttpStatusCode.NoContent, this.errorDefaultMessage[4]);
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> =>
                    of(this.getErrorMessage(error, "Failed to load tours booking"))
            )
        );
    }

    public loadingAllOrderTourToUser(username: string): Observable<IOrderTour[] | IError> {
        return this.http.get(`${this.baseUrl}/order-tours?username=${username}`, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): IOrderTour[] | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return response.body as IOrderTour[];
                } else {
                    return new ErrorMessage(HttpStatusCode.BadRequest, "Invalid data");
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> =>
                    of(this.getErrorMessage(error, "Failed to load order tours"))
            )
        );
    }

    public loadingAllOrderedToursToManager(): Observable<IOrderTour[] | IError> {
        return this.http.get(`${this.baseUrl}/ordered-tours-mn`, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): IOrderTour[] | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return response.body as IOrderTour[];
                } else {
                    return new ErrorMessage(HttpStatusCode.BadRequest, "Invalid data");
                }
            }), catchError((error: HttpErrorResponse): Observable<IError> =>
                of(this.getErrorMessage(error, "Failed to load order tours")))
        );
    }

    public loadingAllOrderHotelToUser(username: string): Observable<IOrderHotels[] | IError> {
        return this.http.get(`${this.baseUrl}/hotel/all-booking-hotel/${username}`, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): IOrderHotels[] | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return response.body as IOrderHotels[];
                } else {
                    return new ErrorMessage(HttpStatusCode.BadRequest, "Invalid data");
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> =>
                    of(this.getErrorMessage(error, "Failed to load order hotels"))
            )
        );
    }

    public loadingAllOrderedHotelsToManager(): Observable<IOrderHotels[] | IError> {
        return this.http.get(`${this.baseUrl}/hotel/all-ordered-hotels`, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): IOrderHotels[] | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return response.body as IOrderHotels[];
                } else {
                    return new ErrorMessage(HttpStatusCode.BadRequest, "Invalid data");
                }
            }), catchError((error: HttpErrorResponse): Observable<IError> =>
                of(this.getErrorMessage(error, "ailed to load order hotels")))
        );
    }

    // block adding // ------------------------------------------------------------
    addUser(user: INewUser): Observable<IUser | IError> {
        return this.http.post(`${this.baseUrl}/add-user`, user, {observe: "response"}).pipe(
            map((resp: HttpResponse<object>): IUser | IError => {
                if (resp.status === HttpStatusCode.Ok) {
                    return resp.body as IUser;
                } else {
                    return new ErrorMessage(HttpStatusCode.BadRequest, "User creation error");
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, this.errorDefaultMessage[0]))
            )
        );
    }

    addRole(role: INewRole): Observable<IRole | IError> {
        return this.http.post(`${this.baseUrl}/add-role`, role, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): IRole | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return response.body as IRole;
                } else {
                    return new ErrorMessage(HttpStatusCode.BadRequest, "Role creation error");
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
                catchError(
                    (error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, this.errorDefaultMessage[0]))
                )
            );
    }

    addCity(city: FormData): Observable<ICityEntity<IMainCountryForCityEntity, IBlobImageEntity> | IError> {
        return this.http.post(`${this.baseUrl}/city-create`, city, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): ICityEntity<IMainCountryForCityEntity, IBlobImageEntity> | IError => {
                if (response.status === HttpStatusCode.Created) {
                    return response.body as ICityEntity<IMainCountryForCityEntity, IBlobImageEntity>;
                } else {
                    return new ErrorMessage(HttpStatusCode.BadRequest, "City creation error");
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, this.errorDefaultMessage[0]))
            )
        );
    }

    addTag(tag: FormData): Observable<ITagEntity | IError> {
        return this.http.post(`${this.baseUrl}/hotel/tags/create`, tag, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): ITagEntity | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return response.body as ITagEntity;
                } else {
                    return new ErrorMessage(HttpStatusCode.BadRequest, "Tag creation error");
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, this.errorDefaultMessage[0]))
            )
        );
    }

    addHotel(hotel: FormData): Observable<number | IError> {
        return this.http.post(`${this.baseUrl}/hotel/create`, hotel, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): number | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return response.body as number;
                } else {
                    return new ErrorMessage(HttpStatusCode.BadRequest, "Hotel creation error");
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, this.errorDefaultMessage[0]))
            )
        );
    }

    addBookingHotel(hotelId: number): Observable<IStatisticHotel | IError> {
        return this.http.get(`${this.baseUrl}/booking-up-hotel?hotelId=${hotelId}`, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): IStatisticHotel | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return response.body as IStatisticHotel;
                } else {
                    return new ErrorMessage(HttpStatusCode.BadRequest, "Booking up hotel error");
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, this.errorDefaultMessage[0]))
            )
        );
    }

    addRoomType(roomType: IRoomTypeCreateEntity): Observable<IAdminRoomType | IError> {
        return this.http.post(`${this.baseUrl}/conveniences/room/add`, roomType, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): IAdminRoomType | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return response.body as IAdminRoomType;
                } else {
                    return new ErrorMessage(HttpStatusCode.BadRequest, "Room creation error");
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, this.errorDefaultMessage[0]))
            )
        );
    }

    addFoodType(foodType: IFoodTypeCreateEntity): Observable<IAdminFoodType | IError> {
        return this.http.post(`${this.baseUrl}/conveniences/food/add`, foodType, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): IAdminFoodType | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return response.body as IAdminFoodType;
                } else {
                    return new ErrorMessage(HttpStatusCode.BadRequest, "Food creation error");
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, this.errorDefaultMessage[0]))
            )
        );
    }

    addFeedback(feedback: IHotelFeedbackEntity): Observable<IHotelFeedbackEntity | IError> {
        return this.http
            .post(`${this.baseUrl}/hotel/${feedback.hotelId}/addFeedback`, feedback, {observe: "response"})
            .pipe(
                map((response: HttpResponse<Object>): IHotelFeedbackEntity | IError => {
                    if (response.status === HttpStatusCode.Ok) {
                        return response.body as IHotelFeedbackEntity;
                    } else {
                        return new ErrorMessage(HttpStatusCode.BadRequest, "Feedback creation error");
                    }
                }),
                catchError(
                    (error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, this.errorDefaultMessage[0]))
                )
            );
    }

    addTour(tour: FormData): Observable<IAdminTour | IError> {
        return this.http.post(`${this.baseUrl}/tour-add`, tour, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): IAdminTour | IError => {
                if (response.status === HttpStatusCode.Created) {
                    return response.body as IAdminTour;
                } else {
                    return new ErrorMessage(HttpStatusCode.BadRequest, "Tour creation error");
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, this.errorDefaultMessage[0]))
            )
        );
    }

    addBookingTour(tourId: number): Observable<IStatisticTour | IError> {
        return this.http.get(`${this.baseUrl}/booking-up-tour?tourId=${tourId}`, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): IStatisticTour | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return response.body as IStatisticTour;
                } else {
                    return new ErrorMessage(HttpStatusCode.BadRequest, "Booking up tour error");
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, this.errorDefaultMessage[0]))
            )
        );
    }

    addBookingHotelAdv(adv: FormData) {
        return this.http.post(`${this.baseUrl}/hotel/book`, adv, {observe: "response"}).pipe(
            map((resp: HttpResponse<Object>): number | IError => {
                if (resp.status === HttpStatusCode.Ok) {
                    return resp.body as number;
                } else {
                    return new ErrorMessage(HttpStatusCode.BadRequest, "User update error");
                }
            })
        );
    }

    createOrderTour(orderTour: ICreateOrderTour): Observable<IOrderTour | IError> {
        return this.http.post(`${this.baseUrl}/order-tour-add`, orderTour, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): IOrderTour | IError => {
                if (response.status === HttpStatusCode.Created) {
                    return response.body as IOrderTour;
                } else {
                    return new ErrorMessage(HttpStatusCode.BadRequest, "Could not book a tour");
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, "Server error during booking"))
            )
        );
    }

    // block update // ------------------------------------------------------------
    updateUser(user: IUser): Observable<boolean | IError> {
        return this.http.post(`${this.baseUrl}/update-user`, user, {observe: "response"}).pipe(
            map((resp: HttpResponse<object>): boolean | IError => {
                if (resp.status === HttpStatusCode.Ok) {
                    return true;
                } else {
                    return new ErrorMessage(HttpStatusCode.BadRequest, "User update error");
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, this.errorDefaultMessage[1]))
            )
        );
    }

    updateUserInfo(user: IUserInfo): Observable<IUserInfo | IError> {
        return this.http.post(`${this.baseUrl}/update-user-info`, user, {observe: "response"}).pipe(
            map((resp: HttpResponse<object>): IUserInfo | IError => {
                if (resp.status === HttpStatusCode.Ok) {
                    return resp.body as IUserInfo;
                } else {
                    return new ErrorMessage(HttpStatusCode.BadRequest, "Error updating user data");
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
                    if (response.status === HttpStatusCode.Ok) {
                        return response.body as ICountryEntity;
                    } else {
                        return new ErrorMessage(HttpStatusCode.BadRequest, "Error updating country data");
                    }
                }),
                catchError(
                    (error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, this.errorDefaultMessage[1]))
                )
            );
    }

    updateCity(city: FormData): Observable<ICityEntity<IMainCountryForCityEntity, IBlobImageEntity> | IError> {
        return this.http.put(`${this.baseUrl}/city-update`, city, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): ICityEntity<IMainCountryForCityEntity, IBlobImageEntity> | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return response.body as ICityEntity<IMainCountryForCityEntity, IBlobImageEntity>;
                } else {
                    return new ErrorMessage(HttpStatusCode.BadRequest, "Error updating city data");
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, this.errorDefaultMessage[1]))
            )
        );
    }

    updateHotel(hotel: FormData): Observable<boolean | IError> {
        return this.http.put(`${this.baseUrl}/hotel/edit`, hotel, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): boolean | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return true;
                } else {
                    return new ErrorMessage(HttpStatusCode.BadRequest, "Failed to update hotel");
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, this.errorDefaultMessage[1]))
            )
        );
    }

    updateRoomType(roomType: IRoomUpdate): Observable<IAdminRoomType | IError> {
        return this.http.post(`${this.baseUrl}/conveniences/rooms/edit`, roomType, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): IAdminRoomType | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return response.body as IAdminRoomType;
                } else {
                    return new ErrorMessage(HttpStatusCode.BadRequest, "Failed to updating room");
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, this.errorDefaultMessage[1]))
            )
        );
    }

    updateFoodType(roomType: IFoodUpdate): Observable<IAdminRoomType | IError> {
        return this.http.post(`${this.baseUrl}/conveniences/food/edit`, roomType, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): IAdminRoomType | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return response.body as IAdminRoomType;
                } else {
                    return new ErrorMessage(HttpStatusCode.BadRequest, "Failed to updating room");
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, this.errorDefaultMessage[1]))
            )
        );
    }

    updateTour(tour: FormData): Observable<IAdminTour | IError> {
        return this.http.put(`${this.baseUrl}/tour-edit`, tour, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): IAdminTour | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return response.body as IAdminTour;
                } else {
                    return new ErrorMessage(HttpStatusCode.BadRequest, "Failed to updating tour");
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, this.errorDefaultMessage[1]))
            )
        );
    }

    canceledOrderTour(orderId: number): Observable<IOrderTour | IError> {
        return this.http.get(`${this.baseUrl}/order-tour-canceled?id=${orderId}`, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): IOrderTour | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return response.body as IOrderTour;
                } else {
                    return new ErrorMessage(HttpStatusCode.BadRequest, "Could not cancel the reservation");
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> =>
                    of(this.getErrorMessage(error, "Server error when canceling a reservation"))
            )
        );
    }

    tourOrderConfirmation(orderId: number): Observable<IOrderTour | IError> {
        return this.http.get(`${this.baseUrl}/tour-reservation-confirmation/${orderId}`, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): IOrderTour | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return response.body as IOrderTour
                } else {
                    return new ErrorMessage(HttpStatusCode.BadRequest, "Unable to confirm tour");
                }
            }), catchError((error: HttpErrorResponse): Observable<IError> =>
                of(this.getErrorMessage(error, "Unable to confirm tour")))
        )
    }

    canceledOrderHotel(orderId: number): Observable<IOrderHotels | IError> {
        return this.http.get(`${this.baseUrl}/hotel/canceled-booking-hotel/${orderId}`, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): IOrderHotels | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return response.body as IOrderHotels;
                } else {
                    return new ErrorMessage(HttpStatusCode.BadRequest, "Could not cancel the reservation");
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> =>
                    of(this.getErrorMessage(error, "Server error when canceling a reservation"))
            )
        );
    }

    hotelOrderConfirmation(orderId: number): Observable<IOrderHotels | IError> {
        return this.http.get(`${this.baseUrl}/hotel/reservation-confirmation/${orderId}`, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): IOrderHotels | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return response.body as IOrderHotels;
                } else {
                    return new ErrorMessage(HttpStatusCode.BadRequest, "Unable to confirm hotel");
                }
            }), catchError((error: HttpErrorResponse): Observable<IError> =>
                of(this.getErrorMessage(error, "Unable to confirm tour"))
            )
        );
    }
    
    //delete block // ------------------------------------------------------------
    deleteUser(id: number): Observable<boolean | IError> {
        return this.http.delete(`${this.baseUrl}/delete-user/${id}`, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): boolean | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return true;
                } else {
                    return new ErrorMessage(HttpStatusCode.BadRequest, this.errorDefaultMessage[3]);
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, this.errorDefaultMessage[2]))
            )
        );
    }

    deleteRole(id: number): Observable<boolean | IError> {
        return this.http.delete(`${this.baseUrl}/delete-role/${id}`, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): boolean | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return true;
                } else {
                    return new ErrorMessage(HttpStatusCode.BadRequest, this.errorDefaultMessage[3]);
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
                    if (response.status === HttpStatusCode.Ok) {
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
                    if (response.status === HttpStatusCode.Ok) {
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
                map((response: HttpResponse<Object>): boolean | IError => {
                    if (response.status === HttpStatusCode.Ok) {
                        return true;
                    } else {
                        return new ErrorMessage(HttpStatusCode.BadRequest, this.errorDefaultMessage[3]);
                    }
                }),
                catchError(
                    (error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, this.errorDefaultMessage[2]))
                )
            );
    }

    deleteCity(id: number): Observable<boolean | IError> {
        return this.http.delete(`${this.baseUrl}/city/remove/${id}`, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): boolean | IError => {
                if (response.status === HttpStatusCode.NoContent) {
                    return true;
                } else {
                    return new ErrorMessage(HttpStatusCode.BadRequest, this.errorDefaultMessage[3]);
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, this.errorDefaultMessage[2]))
            )
        );
    }

    deleteTag(id: number): Observable<boolean | IError> {
        return this.http.delete(`${this.baseUrl}/hotel/tags/delete/${id}`, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): boolean | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return true;
                } else {
                    return new ErrorMessage(HttpStatusCode.BadRequest, this.errorDefaultMessage[3]);
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, this.errorDefaultMessage[2]))
            )
        );
    }

    deleteHotel(id: number): Observable<boolean | IError> {
        return this.http.delete(`${this.baseUrl}/hotel/remove/${id}`, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): boolean | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return true;
                } else {
                    return new ErrorMessage(HttpStatusCode.BadRequest, this.errorDefaultMessage[3]);
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, this.errorDefaultMessage[2]))
            )
        );
    }

    rdBookingHotel(hotelId: number): Observable<IStatisticHotel | IError> {
        return this.http.get(`${this.baseUrl}/booking-down-hotel?hotelId=${hotelId}`, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): IStatisticHotel | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return response.body as IStatisticHotel;
                } else {
                    return new ErrorMessage(HttpStatusCode.BadRequest, "Failed operation");
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> =>
                    of(this.getErrorMessage(error, 'Server error when update statistics"'))
            )
        );
    }

    deleteRoomType(id: number): Observable<boolean | IError> {
        return this.http.delete(`${this.baseUrl}/conveniences/rooms/remove/${id}`, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): boolean | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return true;
                } else {
                    return new ErrorMessage(HttpStatusCode.BadRequest, this.errorDefaultMessage[3]);
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, this.errorDefaultMessage[2]))
            )
        );
    }

    deleteFoodType(id: number): Observable<boolean | IError> {
        return this.http.delete(`${this.baseUrl}/conveniences/food/remove/${id}`, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): boolean | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return true;
                } else {
                    return new ErrorMessage(HttpStatusCode.BadRequest, this.errorDefaultMessage[3]);
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, this.errorDefaultMessage[2]))
            )
        );
    }

    deleteTour(id: number): Observable<boolean | IError> {
        return this.http.delete(`${this.baseUrl}/tour-remove?id=${id}`, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): boolean | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return true;
                } else {
                    return new ErrorMessage(HttpStatusCode.BadRequest, this.errorDefaultMessage[3]);
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> => of(this.getErrorMessage(error, this.errorDefaultMessage[2]))
            )
        );
    }

    rdBookingTour(tourId: number): Observable<IStatisticTour | IError> {
        return this.http.get(`${this.baseUrl}/booking-down-tour?tourId=${tourId}`, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): IStatisticTour | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return response.body as IStatisticTour;
                } else {
                    return new ErrorMessage(HttpStatusCode.BadRequest, "Failed operation");
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> =>
                    of(this.getErrorMessage(error, "Server error when update statistics"))
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
                    return response.status === HttpStatusCode.Ok;
                })
            );
    }

    private checkError(item: any): boolean {
        return (
            item !== null &&
            typeof item === "object" &&
            typeof item.status === "number" &&
            typeof item.message === "string" &&
            typeof item.timestamp === "string" &&
            !isNaN(Date.parse(item.timestamp))
        );
    }

    private getErrorMessage(error: HttpErrorResponse, message: string): IError {
        if (this.checkError(error.error)) {
            const errorBody = error.error as IError;
            return new ErrorMessage(errorBody.status, errorBody.message);
        } else {
            return new ErrorMessage(error.status, message);
        }
    }

    loadingFoodTypesByHotelId(hotelId: number) {
        return this.http.get<Object>(`${this.baseUrl}/conveniences/${hotelId}/food`, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): IAdminFoodType[] | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return response.body as IAdminFoodType[];
                } else {
                    return new ErrorMessage(HttpStatusCode.BadRequest, this.errorDefaultMessage[3]);
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> =>
                    of(this.getErrorMessage(error, "Server error when getting food types"))
            )
        );
    }

    loadingRoomTypesByHotelId(hotelId: number) {
        return this.http.get<Object>(`${this.baseUrl}/conveniences/${hotelId}/rooms`, {observe: "response"}).pipe(
            map((response: HttpResponse<Object>): IAdminRoomType[] | IError => {
                if (response.status === HttpStatusCode.Ok) {
                    return response.body as IAdminRoomType[];
                } else {
                    return new ErrorMessage(HttpStatusCode.BadRequest, this.errorDefaultMessage[3]);
                }
            }),
            catchError(
                (error: HttpErrorResponse): Observable<IError> =>
                    of(this.getErrorMessage(error, "Server error when getting food types"))
            )
        );
    }

    loadingHotelsByParameters(countries: number[], minRate: number, maxRate: number, name: string) {
        let params = new HttpParams();
        params.set("minRate", minRate);
        params.set("maxRate", maxRate);
        params.set("name", name);
        if (countries)
            countries.forEach(country => {
                params.append("cityIds", country);
            });

        let url = `${this.baseUrl}/hotel/search?name=${name}&minRate=${minRate}&maxRate=${maxRate}`;
        if (countries) countries.forEach(el => (url += `&cityIds=${el}`));

        return this.http.get(url, {observe: "response"}).pipe(
            map((resp: HttpResponse<Object>): IHotelEntity[] | IError => {
                if (resp.status === HttpStatusCode.Ok) {
                    return resp.body as IHotelEntity[];
                } else {
                    console.log("error");
                    return new ErrorMessage(HttpStatusCode.NoContent, this.errorDefaultMessage[4]);
                }
            })
        );
    }

    searchHotelsByFilter(name: string, price: number, numberOfPeople: number, cityIds: number[]) {
        let url = `${this.baseUrl}/hotel/search/main-filter?name=${name}&price=${price}&numberOfPeople=${numberOfPeople}`;

        if (cityIds && cityIds.length > 0) {
            cityIds.forEach(id => url += `&cityIds=${id}`);
        }

        return this.http.get(url, {observe: "response"}).pipe(
            map((resp: HttpResponse<Object>): Number[] | IError => {
                if (resp.status === HttpStatusCode.Ok) {
                    return resp.body as Number[];
                } else {
                    console.log("error");
                    return new ErrorMessage(HttpStatusCode.NoContent, this.errorDefaultMessage[4]);
                }
            })
        );
    }

}
