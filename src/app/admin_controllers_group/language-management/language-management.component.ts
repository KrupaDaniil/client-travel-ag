import {
	AfterViewChecked,
	Component,
	computed,
	effect,
	ElementRef,
	inject,
	OnInit,
	Renderer2,
	signal,
	Signal,
	ViewChild,
	WritableSignal
} from "@angular/core";
import { EntityStorage } from "../../../storage/entity.storage";
import { MessageService } from "../../../services/message.service";
import { ILanguageEntity } from "../../../interfaces/country-block/i-language.entity";
import { FormControl, ReactiveFormsModule, Validators } from "@angular/forms";
import { LanguageService } from "../../../services/language.service";

@Component({
	selector: "app-language-management",
	imports: [ReactiveFormsModule],
	providers: [LanguageService, MessageService],
	templateUrl: "./language-management.component.html",
	styleUrl: "./language-management.component.css"
})
export class LanguageManagementComponent implements OnInit, AfterViewChecked {
	private readonly store = inject(EntityStorage);

	private isSelectedRow: boolean;
	private timerId: number | undefined;
	loadingFailed: WritableSignal<boolean> = signal<boolean>(false);
	private selectedLanguage: ILanguageEntity | undefined;

	languagesList: Signal<ILanguageEntity[]> = computed(() => this.store.languagesEntities());
	showError: Signal<string | null> = computed(() => this.message.message());

	languageName: FormControl;

	@ViewChild("addLanguageBlock") addLanguageBlock?: ElementRef<HTMLDivElement>;
	@ViewChild("buttonsGroup") buttonsGroup?: ElementRef<HTMLDivElement>;
	@ViewChild("addLanguageBtn") addLanguageBtn?: ElementRef<HTMLButtonElement>;
	@ViewChild("removeLanguageBtn")
	removeLanguageBtn?: ElementRef<HTMLButtonElement>;
	@ViewChild("languageBlock")
	languageBlock?: ElementRef<HTMLTableSectionElement>;

	constructor(private languageService: LanguageService, private message: MessageService, private render: Renderer2) {
		this.isSelectedRow = false;
		this.languageName = new FormControl("", Validators.required);
	}

	ngOnInit(): void {
		this.languageService.addingAllLanguages();
	}

	ngAfterViewChecked(): void {
		this.displayAdditionBlock();
		this.selectTableRow();
	}

	private loadingStatus(): void {
		effect((): void => {
			if (this.languagesList() && this.languagesList.length > 0) {
				this.loadingFailed.set(false);

				if (this.timerId) {
					window.clearTimeout(this.timerId);
					this.timerId = undefined;
				}
			}

			this.timerId = window.setTimeout((): void => {
				this.loadingFailed.set(true);
			}, 30000);
		});
	}

	private displayAdditionBlock(): void {
		if (
			this.buttonsGroup?.nativeElement &&
			this.addLanguageBtn?.nativeElement &&
			this.addLanguageBlock?.nativeElement
		) {
			this.render.listen(this.addLanguageBtn.nativeElement, "click", () => {
				this.render.addClass(this.buttonsGroup?.nativeElement, "hide-block");
				this.render.addClass(this.addLanguageBlock?.nativeElement, "show-block");
			});
		}
	}

	createLanguage(): void {
		if (this.languageName.value) {
			this.languageService.addLanguage(this.languageName.value);
			this.languageName.reset();
		}
	}

	cancel(): void {
		this.render.removeClass(this.addLanguageBlock?.nativeElement, "show-block");
		this.render.removeClass(this.buttonsGroup?.nativeElement, "hide-block");
	}

	private selectTableRow(): void {
		if (this.languageBlock?.nativeElement && !this.isSelectedRow) {
			this.isSelectedRow = true;
			this.render.listen(this.languageBlock.nativeElement, "click", (e: Event) => {
				const trg = e.target as HTMLElement;

				if (trg.tagName.toLocaleLowerCase() === "td") {
					const rw = trg.closest("tr") as HTMLTableRowElement;

					if (rw) {
						const flag = rw.querySelector("input[type='radio']") as HTMLInputElement;

						if (flag) {
							this.render.setProperty(flag, "checked", true);

							const selectId = Number.parseInt(rw.dataset["languageId"] as string);

							this.languagesList().forEach(language => {
								if (language.id === selectId) {
									this.selectedLanguage = language;
									return;
								}
							});

							if (this.selectedLanguage) {
								if (this.removeLanguageBtn?.nativeElement) {
									this.render.listen(this.removeLanguageBtn.nativeElement, "click", () => {
										this.languageService.removeLanguage(selectId);
										this.selectedLanguage = undefined;
										this.isSelectedRow = false;
										this.render.setProperty(this.languageBlock!.nativeElement, "checked", false);
									});
								}
							}
						}
					}
				}
			});
		}
	}
}
