import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs";


@Injectable()
export class KeyboardService {
  public keyboard: BehaviorSubject<any> = new BehaviorSubject <any> (null);
}
