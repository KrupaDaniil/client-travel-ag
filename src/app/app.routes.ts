import {Routes} from "@angular/router";
import {LoginComponent} from "./login/login.component";
import {RegistrationComponent} from "./registration/registration.component";
import {Error404Component} from "./error_controllers_group/error-404/error-404.component";
import {Error401Component} from "./error_controllers_group/error-401/error-401.component";
import {Error400Component} from "./error_controllers_group/error-400/error-400.component";
import {SuccessfulRegistrationComponent} from "./successful-registration/successful-registration.component";
import {MainUserComponent} from "./user_controllers_group/main.user/main.user.component";
import {AdminPanelComponent} from "./admin_controllers_group/admin.panel/admin.panel.component";
import {UserManagementComponent} from "./admin_controllers_group/user-management/user-management.component";
import {RoleManagementComponent} from "./admin_controllers_group/role-management/role-management.component";
import {
  UserCompletedToursComponent
} from "./user_controllers_group/user-completed-tours/user-completed-tours.component";
import {BookedToursComponent} from "./user_controllers_group/booked-tours/booked-tours.component";
import {UserInformationComponent} from "./user_controllers_group/user-information/user-information.component";
import {CountryManagementComponent} from "./admin_controllers_group/country-management/country-management.component";
import {CityManagementComponent} from "./admin_controllers_group/city-management/city-management.component";
import {ClimateManagementComponent} from "./admin_controllers_group/climate-management/climate-management.component";
import {LanguageManagementComponent} from "./admin_controllers_group/language-management/language-management.component";
import {FromToManagementComponent} from "./admin_controllers_group/from-to-management/from-to-management.component";
import {LoginStartComponent} from "./user_controllers_group/login-start/login-start.component";
import {HotelsListByCityComponent} from "./hotel-controllers-group/hotels-list-by-city/hotels-list-by-city.component";
import {TagManagementComponent} from "./admin_controllers_group/tag-management/tag-management.component";
import {HotelDetailsComponent} from "./hotel-controllers-group/hotel-details/hotel-details.component";
import {HotelManagementComponent} from "./admin_controllers_group/hotel-management/hotel-management.component";
import {
  RoomTypeManagementComponent
} from "./admin_controllers_group/room-type-management/room-type-management.component";
import {
  FoodTypeManagementComponent
} from "./admin_controllers_group/food-type-management/food-type-management.component";
import {TourManagementComponent} from './admin_controllers_group/tour-management/tour-management.component';
import {StatisticComponent} from './admin_controllers_group/statistic/statistic.component';
import {HotelAllFeedbacksComponent} from './hotel-controllers-group/hotel-all-feedbacks/hotel-all-feedbacks.component';

export const routes: Routes = [
  {path: "", component: MainUserComponent},
  {path: "login", component: LoginComponent},
  {path: "registration", component: RegistrationComponent},
  {path: "forbidden", component: Error401Component},
  {path: "error-data", component: Error400Component},
  {
    path: "successful-registration",
    component: SuccessfulRegistrationComponent
  },
  {path: "user-tours", component: UserCompletedToursComponent},
  {path: "booked-tours", component: BookedToursComponent},
  {path: "user-information", component: UserInformationComponent},
  {
    path: "admin-panel",
    component: AdminPanelComponent,
    children: [
      {path: "user-management", component: UserManagementComponent},
      {path: "role-management", component: RoleManagementComponent},
      {path: "county-management", component: CountryManagementComponent},
      {path: "city-management", component: CityManagementComponent},
      {path: "climate-management", component: ClimateManagementComponent},
      {path: "language-management", component: LanguageManagementComponent},
      {path: "country-management", component: CountryManagementComponent},
      {path: "city-management", component: CityManagementComponent},
      {path: "from-to-management", component: FromToManagementComponent},
      {path: "tag-management", component: TagManagementComponent},
      {path: "hotel-management", component: HotelManagementComponent},
      {path: "room-type-management", component: RoomTypeManagementComponent},
      {path: "food-type-management", component: FoodTypeManagementComponent},
      {path: "tour-management", component: TourManagementComponent},
      {path: "statistics", component: StatisticComponent}
    ]
  },
  {path: "authorization", component: LoginStartComponent},
  {
    path: "hotels/:countryId",
    component: HotelsListByCityComponent
  },
  {
    path: "hotels/view/:hotelId",
    component: HotelDetailsComponent
  },
  {
    path: "hotels/:id/feedbacks",
    component: HotelAllFeedbacksComponent
  },
  {path: "**", component: Error404Component}
];
