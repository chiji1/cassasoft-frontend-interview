import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment as env } from '../../environments/environment';
import { Ingredient } from '../types/ingredients.type';
import { formatImageUrl } from '../utils/function.util';
import { IngredientRequestsService } from './ingredient-requests.service';

@Injectable({
  providedIn: 'root'
})
export class IngredientStateService implements OnDestroy {
  private ingredients$: BehaviorSubject<Ingredient[]> = new BehaviorSubject<Ingredient[]>([]);
  private subscriptions: Subscription[] = [];

  constructor(
    private readonly ingredientReqSrv: IngredientRequestsService
  ) { }

  getall(): void {
    this.subscriptions.push(
      this.ingredientReqSrv
        .getAll()
        .pipe(
          map((res) => {
            return res.payload.map((ingredient) => {
              return {
                ...ingredient,
                image: formatImageUrl(ingredient?.image),
              }
            });
          })
        ).subscribe((res) => {
          this.ingredients$.next(res);
        })
    );
  }

  getState(): Observable<Ingredient[]> {
    return this.ingredients$.asObservable();
  }

  put(ingredient: Ingredient): void {
    const ingredientFound = this.ingredients$.value.find((ing) => ing.id === ingredient.id);
    if (ingredientFound?.id) {
      this.subscriptions.push(
        this.ingredientReqSrv
          .put(ingredient)
          .subscribe(({ payload, success }) => {
            if (success === true) {
              const updatedIngredientList: Ingredient[] =
              this.ingredients$.value.map((ing) => {
                if(ing.id === ingredient.id) {
                  return { 
                    ...payload,
                    image: formatImageUrl(payload?.image),
                  }
                }
                else {
                  return { ...ing };
                }
              });
              setTimeout(() => this.ingredients$.next(updatedIngredientList), 200);
            }
          })
      );
    }
  }

  add(title: string, imageUrl: string): void {  
    this.subscriptions.push(
      this.ingredientReqSrv
      .post(title, imageUrl)
      .subscribe(({ success, payload }) => {
        if (success === true) {
          const ingredients = [
            ...this.ingredients$.value, 
            { 
              ...payload,
              image: formatImageUrl(payload?.image),
            }
          ];
          setTimeout(() => this.ingredients$.next(ingredients), 200);
        }
      })
    );
  }

  delete(id: string): void {
    this.subscriptions.push(
      this.ingredientReqSrv
      .delete(id)
      .subscribe(({ success }) => {
        if (success === true) {
          const filteredIngredients = this.ingredients$.value.filter((ingredient) => ingredient.id !== id);
          setTimeout(() => this.ingredients$.next(filteredIngredients), 200);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
