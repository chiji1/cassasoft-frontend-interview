import { Component, Input, OnDestroy, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbDateAdapter, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { EMPTY, of, Subscription } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { CustomersService } from '../../../_services';
import { CustomAdapter, CustomDateParserFormatter, getDateFromString } from '../../../../../_metronic/core';
import { Ingredient, NutrientsEntity } from 'src/app/types/ingredients.type';
import { IngredientRequestsService } from 'src/app/services/ingredient-requests.service';
import { convertFilesToBase64Strings, formatImageUrl } from 'src/app/utils/function.util';
import { environment as env } from '../../../../../../environments/environment';
import { IngredientStateService } from 'src/app/services/ingredient-state.service';

const EMPTY_INGREDIENT: Ingredient = {
  id: undefined,
  createdAt: new Date(),
  updatedAt: new Date(),
  image: undefined,
  title: undefined,

  fat: undefined,
  calories: undefined,
  carbohydrates: undefined,
};

@Component({
  selector: 'app-edit-customer-modal',
  templateUrl: './edit-customer-modal.component.html',
  styleUrls: ['./edit-customer-modal.component.scss'],
  // NOTE: For this example we are only providing current component, but probably
  // NOTE: you will w  ant to provide your main App Module
  providers: [
    {provide: NgbDateAdapter, useClass: CustomAdapter},
    {provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter}
  ]
})
export class EditCustomerModalComponent implements OnInit, OnDestroy {
  @Input() id: string;
  @Output() ingredientCreated: EventEmitter<Ingredient> = new EventEmitter<Ingredient>();
  isLoading$;
  // customer: Customer;
  ingredient: Ingredient;
  formGroup: FormGroup;
  private subscriptions: Subscription[] = [];
  base64Url: string;
  isNutrientLoaded: boolean = false;
  hasError = false;
  hasSuccess = false;
  returnMessage = '';
  @ViewChild('form') formEl: ElementRef;

  constructor(
    private customersService: CustomersService,
    private fb: FormBuilder, public modal: NgbActiveModal,
    private readonly ingredientReqSrv: IngredientRequestsService,
    private readonly ingredientStateSrv: IngredientStateService,
    ) { }

  ngOnInit(): void {
    this.isLoading$ = this.customersService.isLoading$;
    this.loadIngredient();
    this.initForm();
  }

  initForm(ingredient?: Ingredient): void {
    this.formGroup = new FormGroup({
      title: new FormControl(ingredient?.title ?? null, Validators.required),
      imageUrl: new FormControl(ingredient?.image ?? null, Validators.required),
      fat: new FormControl(ingredient?.fat ?? null),
      calories: new FormControl(ingredient?.calories ?? null),
      carbohydrates: new FormControl(ingredient?.carbohydrates ?? null),
    });
  }

  async onChange(event: Event): Promise<void> {
    const [imageUrl] = await convertFilesToBase64Strings(event);
    this.base64Url = imageUrl;
    this.formGroup.patchValue({ imageUrl });
    this.formGroup.get('imageUrl').updateValueAndValidity();
  }

  loadIngredient(): void {
    if (this.id) {
      const ingredientResponseSubscription: Subscription =
      this.ingredientReqSrv
          .getSingle(this.id)
          .pipe(
                  map(({ payload }) => {
                    return {
                      ...payload,
                        image: formatImageUrl(payload?.image),
                    }
                  }),
                  tap((res) => {
                    this.ingredient = res;
                    this.base64Url = res.image;
                  }),
                  mergeMap((res) => this.ingredientReqSrv.searchIngredient(res.title)),
                  mergeMap(([first]) => this.ingredientReqSrv.getSpoonocularIngredientInfo(first.id)),
                  map((res) => res.nutrition.nutrients),
                  // catchError((error) => throwError(error)),
                  catchError((error) => of([]))
          ).subscribe(res => {
            const fat = this.pickNutientByKey('Fat', res);
            const calories = this.pickNutientByKey('Calories', res);
            const carbohydrates = this.pickNutientByKey('Carbohydrates', res);

            this.ingredient = {
              ...this.ingredient,
              fat: fat?.amount ?? 0,
              carbohydrates: carbohydrates?.amount ?? 0,
              calories: calories?.amount ?? 0,
            };
            this.initForm(this.ingredient);
          });
      this.subscriptions.push(ingredientResponseSubscription);
    }
    else {
      this.ingredient = EMPTY_INGREDIENT;
    }
  }

  pickNutientByKey(key: string, payload: NutrientsEntity[]): NutrientsEntity {
    return payload.find((nutrient) => nutrient.name === key);
  }

  loadNutrientData(): void {
    this.isNutrientLoaded = !this.isNutrientLoaded;
  }

  save() {
    if (this.formGroup.invalid) {
      return;
    }
    const { value: { title, imageUrl } } = this.formGroup;
    this.prepareIngredient();
    if (this.ingredient.id) {
      this.ingredientStateSrv.put(this.ingredient);
      this.hasSuccess = true;
    } else {
      this.ingredientStateSrv.add(title, imageUrl);
      this.formGroup.reset();
      this.base64Url = null;
      this.hasSuccess = true;
    }
    this.modal.dismiss();
  }

  private prepareIngredient() {
    const formData = this.formGroup.value;
    this.ingredient.image = formData.imageUrl;
    this.ingredient.title = formData.title;
    this.ingredient.fat = formData.fat;
    this.ingredient.calories = formData.calories;
    this.ingredient.carbohydrates = formData.carbohydrates
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }

  // helpers for View
  isControlValid(controlName: string): boolean {
    const control = this.formGroup.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.formGroup.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  controlHasError(validation, controlName): boolean {
    const control = this.formGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  isControlTouched(controlName): boolean {
    const control = this.formGroup.controls[controlName];
    return control.dirty || control.touched;
  }
}
