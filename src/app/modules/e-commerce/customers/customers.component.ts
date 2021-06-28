// tslint:disable:no-string-literal
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject,  Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CustomersService } from '../_services';
import {
  GroupingState,
  PaginatorState,
  SortState,
  ICreateAction,
  IEditAction,
  IDeleteAction,
  IDeleteSelectedAction,
  IFetchSelectedAction,
  IUpdateStatusForSelectedAction,
  ISortView,
  IFilterView,
  IGroupingView,
  ISearchView,
} from '../../../_metronic/shared/crud-table';
import { DeleteCustomerModalComponent } from './components/delete-customer-modal/delete-customer-modal.component';
import { DeleteCustomersModalComponent } from './components/delete-customers-modal/delete-customers-modal.component';
import { UpdateCustomersStatusModalComponent } from './components/update-customers-status-modal/update-customers-status-modal.component';
import { FetchCustomersModalComponent } from './components/fetch-customers-modal/fetch-customers-modal.component';
import { EditCustomerModalComponent } from './components/edit-customer-modal/edit-customer-modal.component';
import { IngredientRequestsService } from 'src/app/services/ingredient-requests.service';
import { Ingredient } from 'src/app/types/ingredients.type';
import { environment as env } from '../../../../environments/environment';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss'],
})
export class CustomersComponent
  implements
  OnInit,
  OnDestroy,
  ICreateAction,
  IEditAction,
  IDeleteAction,
  IDeleteSelectedAction,
  IFetchSelectedAction,
  IUpdateStatusForSelectedAction,
  ISortView,
  IFilterView,
  IGroupingView,
  ISearchView,
  IFilterView {
  paginator: PaginatorState;
  sorting: SortState;
  grouping: GroupingState;
  isLoading: boolean;
  filterGroup: FormGroup;
  searchGroup: FormGroup;
  private subscriptions: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
  // ingredients$: Observable<Ingredient[]>;
  ingredients$: BehaviorSubject<Ingredient[]> = new BehaviorSubject<Ingredient[]>([]);

  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    public customerService: CustomersService,
    private readonly ingredientReqSrv: IngredientRequestsService,
  ) { }

  // angular lifecircle hooks
  ngOnInit(): void {
    this.filterForm();
    this.searchForm();
    this.customerService.fetch();
    this.grouping = this.customerService.grouping;
    this.paginator = this.customerService.paginator;
    this.sorting = this.customerService.sorting;
    const sb = this.customerService.isLoading$.subscribe(res => this.isLoading = res);
    this.subscriptions.push(sb);
    this.loadData();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }

  loadData(): void {
    const ingredientSubscription: Subscription =
    this.ingredientReqSrv
        .getAll()
        .pipe(
          map((res) => {
            return res.payload.map((ingredient) => {
              return {
                ...ingredient,
                image: ingredient.image.startsWith(env.apiRoot) ?
                  ingredient.image :
                  `${env.apiRoot}/${ingredient.image}`,
              }
            });
          })
        ).subscribe((res) => {
          this.ingredients$.next(res);
        });
    this.subscriptions.push(ingredientSubscription);
  }

  // filtration
  filterForm() {
    this.filterGroup = this.fb.group({
      status: [''],
      type: [''],
      searchTerm: [''],
    });
    this.subscriptions.push(
      this.filterGroup.controls.status.valueChanges.subscribe(() =>
        this.filter()
      )
    );
    this.subscriptions.push(
      this.filterGroup.controls.type.valueChanges.subscribe(() => this.filter())
    );
  }

  filter() {
    const filter = {};
    const status = this.filterGroup.get('status').value;
    if (status) {
      filter['status'] = status;
    }

    const type = this.filterGroup.get('type').value;
    if (type) {
      filter['type'] = type;
    }
    this.customerService.patchState({ filter });
  }

  // search
  searchForm() {
    this.searchGroup = this.fb.group({
      searchTerm: [''],
    });
    const searchEvent = this.searchGroup.controls.searchTerm.valueChanges
      .pipe(
        /*
      The user can type quite quickly in the input box, and that could trigger a lot of server requests. With this operator,
      we are limiting the amount of server requests emitted to a maximum of one every 150ms
      */
        debounceTime(150),
        distinctUntilChanged()
      )
      .subscribe((val) => this.search(val));
    this.subscriptions.push(searchEvent);
  }

  search(searchTerm: string) {
    this.customerService.patchState({ searchTerm });
  }

  // sorting
  sort(column: string) {
    const sorting = this.sorting;
    const isActiveColumn = sorting.column === column;
    if (!isActiveColumn) {
      sorting.column = column;
      sorting.direction = 'asc';
    } else {
      sorting.direction = sorting.direction === 'asc' ? 'desc' : 'asc';
    }
    this.customerService.patchState({ sorting });
  }

  // pagination
  paginate(paginator: PaginatorState) {
    this.customerService.patchState({ paginator });
  }

  // form actions
  create() {
    this.edit(undefined);
  }

  edit(id: number) {
    const modalRef = this.modalService.open(EditCustomerModalComponent, { size: 'md' });
    modalRef.componentInstance.id = id;
    modalRef.result.then(() =>
        this.ingredientReqSrv.getAll(),
      () => { }
    );
  }

  onEdit(id: string): void {
    const modalRef = this.modalService.open(EditCustomerModalComponent, { size: 'md' });
    modalRef.componentInstance.id = id;
  }

  // todo: refactor
  onDelete(id: string): void {
    this.ingredientReqSrv
        .delete(id)
        .subscribe(({ success }) => {
          if (success === true) {
            this.ingredients$.subscribe((res) => {
              const filteredIngredients = res.filter((ingredient) => ingredient.id !== id);
              setTimeout(() => this.ingredients$.next(filteredIngredients), 200);
            });
          }
        });
  }

  delete(id: number) {
    const modalRef = this.modalService.open(DeleteCustomerModalComponent);
    modalRef.componentInstance.id = id;
    modalRef.result.then(() => this.customerService.fetch(), () => { });
  }

  deleteSelected() {
    const modalRef = this.modalService.open(DeleteCustomersModalComponent);
    modalRef.componentInstance.ids = this.grouping.getSelectedRows();
    modalRef.result.then(() => this.customerService.fetch(), () => { });
  }

  updateStatusForSelected() {
    const modalRef = this.modalService.open(UpdateCustomersStatusModalComponent);
    modalRef.componentInstance.ids = this.grouping.getSelectedRows();
    modalRef.result.then(() => this.customerService.fetch(), () => { });
  }

  fetchSelected() {
    const modalRef = this.modalService.open(FetchCustomersModalComponent);
    modalRef.componentInstance.ids = this.grouping.getSelectedRows();
    modalRef.result.then(() => this.customerService.fetch(), () => { });
  }
}
