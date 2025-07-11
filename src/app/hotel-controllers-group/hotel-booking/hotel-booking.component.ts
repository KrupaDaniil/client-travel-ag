import {
	Component,
	computed,
	ElementRef,
	inject,
	Input,
	OnInit,
	signal,
	Signal,
	ViewChild,
	WritableSignal
} from "@angular/core";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {KeyValuePipe, NgIf, NgOptimizedImage} from "@angular/common";
import {OwlDateTimeModule} from "@danielmoncada/angular-datetime-picker";
import {StatisticService} from "../../../services/statistic.service";
import {HotelService} from "../../../services/Hotels/hotel.service";
import {ValidationService} from "../../../services/validation.service";
import {IError} from "../../../interfaces/i-error";
import {IHotelDetailsEntity} from "../../../interfaces/hotels-block/i-hotel-details.entity";
import {ICityBookingEntity} from "../../../interfaces/country-block/i-city-booking.entity";
import {HotToastService} from "@ngxpert/hot-toast";
import {CityService} from '../../../services/city.service';
import {EntityStoragePr2} from '../../../storage/entity.storage.pr2';
import {IUser} from '../../../interfaces/i-user';
import {EntityStorage} from '../../../storage/entity.storage';
import {UserService} from '../../../services/user.service';
import {IMinUser} from '../../../interfaces/i-min-user';

@Component({
    selector: "app-hotel-booking",
    imports: [ReactiveFormsModule, NgOptimizedImage, OwlDateTimeModule, KeyValuePipe, NgIf],
    providers: [StatisticService],
    templateUrl: "./hotel-booking.component.html",
    styleUrl: "./hotel-booking.component.css"
})
export class HotelBookingComponent implements OnInit {
    public bookForm: FormGroup = new FormGroup({
        checkin: new FormControl("", [Validators.required]),
        checkout: new FormControl("", [Validators.required]),
        amount: new FormControl("", [Validators.required]),
        roomType: new FormControl("", [Validators.required, Validators.min(1)]),
        foodType: new FormControl("", [Validators.required, Validators.min(1)]),
        from: new FormControl(0, [Validators.required, Validators.min(1)]),
        phoneNumber: new FormControl("", [Validators.required])
    });

    protected readonly Array = Array;

    @Input() hotel?: IHotelDetailsEntity;

    @ViewChild("checkinInp") checkinInp?: ElementRef;
    @ViewChild("checkoutInp") checkoutInp?: ElementRef;
    @ViewChild("foodInp") foodInp?: ElementRef;
    @ViewChild("roomInp") roomInp?: ElementRef;

    @ViewChild("successModal") successModal?: ElementRef;
    @ViewChild("closeBookingModal") closeBookingModal?: ElementRef;


    readonly storePr2 = inject(EntityStoragePr2);
    readonly store = inject(EntityStorage);
    readonly cities: Signal<ICityBookingEntity[]> = computed(() => this.storePr2.minCityCountryEntities());

    readonly users: Signal<IUser[]> = computed(() => this.store.usersEntities());
    readonly currentUser: WritableSignal<IMinUser | null> = signal<IMinUser | null>(null);

    public loadingBooking: boolean = false;

    constructor(
        private stService: StatisticService,
        private hotelService: HotelService,
        private check: ValidationService,
        private citiesService: CityService,
        private toast: HotToastService,
        private userService: UserService,
    ) {
    }

    protected countApp(): void {
        if (this.hotel && this.hotel.id > 0) {
            this.stService.countHBUp(this.hotel.id);
        }
    }

    public bookHotel(): void {
        if (this.bookForm.valid) {
            if (this.hotel) {
                let data = this.bookForm.value;
                data.hotelId = this.hotel.id;
                this.loadingBooking = true;

                this.hotelService.bookHotel(this.bookForm.value).subscribe(res => {
                    if (this.check.isHttpError(res as IError)) {
                        this.showErrorMessage("Помилка при бронюванні готелю!");
                    } else {
                        this.loadingBooking = false;
                        this.closeBookingModal?.nativeElement.click();
                        this.successModal?.nativeElement.click();
                    }
                });
            }
        }
    }


    ngOnInit(): void {
        this.initCitiesFrom();
        this.initCurrentUser();
    }

    private initCitiesFrom() {
        if (this.cities().length == 0) {
            this.citiesService.setAllMinCityCountry().subscribe(res => {
                if (this.check.isError(res as IError)) {
                    this.toast.show("Error loading cities");
                }
            })
        }
    }

    private initCurrentUser(): void {

        if (this.store.username()) {
            this.userService.loadingMinUserByUsername(this.store.username()).then(res => {
                if (res) {
                    this.currentUser.set(res);
                    console.log(res);
                } else
                    this.showErrorMessage("Can't find user!");
            })
        } else {
            console.log("sd");
        }
    }

    get getCategorizedCities() {
        let countryMap = new Map();
        this.cities().forEach(({countryName, cityName, cityId}) => {
            const city = {cityName, cityId};
            if (!countryMap.has(countryName)) {
                countryMap.set(countryName, [city]);
            } else {
                countryMap.get(countryName).push(city);
            }
        });
        return countryMap;
    }

    private showErrorMessage(message: string): void {
        this.toast.show(`${message}`, {
            theme: "snackbar",
            duration: 5000,
            autoClose: true,
            position: "bottom-left"
        });
    }

    get countSum() {
        if (!this.hotel) {
            return "-";
        }
        let food = this.foodInp?.nativeElement.value;
        let room = this.roomInp?.nativeElement.value;
        let from = this.checkinInp?.nativeElement.value;
        let to = this.checkoutInp?.nativeElement.value;
        let sum = 0;
        if (food) sum += this.hotel.foodTypes.find(x => x.id == food) ? this.hotel.foodTypes.find(x => x.id == food)!.price : 0;
        if (room) sum += this.hotel.roomTypes.find(x => x.id == room) ? this.hotel.roomTypes.find(x => x.id == room)!.price : 0;

        if (from && to) {
            return sum * ((this.parseDate(to).getTime() - this.parseDate(from).getTime()) / (1000 * 60 * 60 * 24));
        }

        return "-";
    }

    parseDate(str: any) {
        const [day, month, year] = str.split(".");
        return new Date(year, month - 1, day);
    }
}
