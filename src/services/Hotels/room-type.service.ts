import {inject, Injectable} from "@angular/core";
import {EntityStoragePr2} from "../../storage/entity.storage.pr2";
import {HttpService} from "../http.service";
import {ValidationService} from "../validation.service";
import {MessageService} from "../message.service";
import {IAdminRoomType} from "../../interfaces/hotels-block/i-admin-room-type";
import {IError} from "../../interfaces/i-error";
import {IRoomTypeCreateEntity} from "../../interfaces/hotels-block/i-room-type-create.entity";
import {IRoomUpdate} from "../../interfaces/hotels-block/i-room-update";
import {IMinHotel} from "../../interfaces/hotels-block/i-min-hotel";
import {map, Observable} from "rxjs";

@Injectable({
  providedIn: "root"
})
export class RoomTypeService {
  private readonly _storePr2 = inject(EntityStoragePr2);

  constructor(private http_s: HttpService, private message: MessageService, private check: ValidationService) {
  }

  setAllRoomTypes(): void {
    this.http_s.loadingAllRoomTypes().subscribe({
      next: (item: IAdminRoomType[] | IError): void => {
        if (this.check.isError(item)) {
          this.message.setMessage((item as IError).message);
        } else {
          this.message.setMessage(null);
          this._storePr2.setAllRoomTypes(item as IAdminRoomType[]);
        }
      }
    });
  }

  getAllMinHotels(): Observable<IMinHotel[] | undefined> {
    return this.http_s.loadingAllMinHotel().pipe(
      map((item: IMinHotel[] | IError): IMinHotel[] | undefined => {
        if (this.check.isError(item)) {
          this.message.setMessage((item as IError).message);
          return undefined;
        } else {
          if (Array.isArray(item)) {
            return item as IMinHotel[];
          } else {
            return undefined;
          }
        }
      })
    );
  }

  addRoomType(item: IRoomTypeCreateEntity): void {
    this.http_s.addRoomType(item).subscribe({
      next: (item: IAdminRoomType | IError): void => {
        if (this.check.isError(item)) {
          this.message.setMessage((item as IError).message);
        } else {
          this.message.setMessage(null);
          this._storePr2.setRoomType(item as IAdminRoomType);
        }
      }
    });
  }

  editRoomType(item: IRoomUpdate): void {
    this.http_s.updateRoomType(item).subscribe({
      next: (item: IAdminRoomType | IError): void => {
        if (this.check.isError(item)) {
          this.message.setMessage((item as IError).message);
        } else {
          this.message.setMessage(null);
          this._storePr2.setRoomType(item as IAdminRoomType);
        }
      }
    });
  }

  removeRooType(id: number): void {
    this.http_s.deleteRoomType(id).subscribe({
      next: (item: boolean | IError): void => {
        if (this.check.isError(item)) {
          this.message.setMessage((item as IError).message);
        } else {
          if (item) {
            this.message.setMessage(null);
            this._storePr2.removeRoomType(id);
          }
        }
      }
    });
  }
}
