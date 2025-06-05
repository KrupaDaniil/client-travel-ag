import {
	Component,
	computed,
	effect,
	ElementRef,
	inject,
	OnInit,
	Renderer2,
	signal,
	Signal,
	viewChild,
	WritableSignal
} from "@angular/core";
import { TagService } from "../../../services/hotels/tag.service";
import { MessageService } from "../../../services/message.service";
import { ITagEntity } from "../../../interfaces/hotels-block/i-tag.entity";
import { EntityStorage } from "../../../storage/entity.storage";
import { FormControl, ReactiveFormsModule, Validators } from "@angular/forms";
import { HotToastService } from "@ngxpert/hot-toast";
import { NgIf, NgOptimizedImage } from "@angular/common";

@Component({
	selector: "app-tag-management",
	imports: [ReactiveFormsModule, NgIf, NgOptimizedImage],
	providers: [TagService, MessageService],
	templateUrl: "./tag-management.component.html",
	styleUrl: "./tag-management.component.css"
})
export class TagManagementComponent implements OnInit {
	private readonly store = inject(EntityStorage);
	private toast: HotToastService = inject(HotToastService);

	protected tags: Signal<ITagEntity[]> = computed(() => this.store.tagsEntities());
	private messages: Signal<string | null> = computed(() => this.message.message());
	loadingFailed: WritableSignal<boolean>;

	addTagInput: FormControl;
	addTagImage: File | null;

	private selectedTag: ITagEntity | undefined;
	private isSelectedRow: boolean;

	private readonly addTagDialog: Signal<ElementRef<HTMLDialogElement> | undefined> =
		viewChild<ElementRef<HTMLDialogElement>>("addTagDialog");
	private readonly tagBlock: Signal<ElementRef<HTMLTableSectionElement> | undefined> =
		viewChild<ElementRef<HTMLTableSectionElement>>("tagBlock");
	private readonly removeBtn: Signal<ElementRef<HTMLButtonElement> | undefined> =
		viewChild<ElementRef<HTMLButtonElement>>("removeTagBtn");

	constructor(private tagService: TagService, private message: MessageService, private render: Renderer2) {
		this.addTagInput = new FormControl("", [Validators.required]);
		this.addTagImage = null;
		this.isSelectedRow = false;
		this.loadingFailed = signal<boolean>(false);
		this.showMessage();
		this.showLoadingFailed();
	}

	ngOnInit(): void {
		this.tagService.setAllTags();
		this.onSelectedRow();
	}

	onSelectedFile(event: Event): void {
		const fl = event.target as HTMLInputElement;

		if (fl && fl.files && fl.files.length > 0) {
			this.addTagImage = fl.files[0];
		} else {
			this.addTagImage = null;
		}
	}

	onSubmit(): void {
		if (this.addTagInput.valid && this.addTagInput.value) {
			const data: FormData = new FormData();
			data.append("tagName", this.addTagInput.value);
			if (this.addTagImage) {
				data.append("tagImage", this.addTagImage);
			}

			this.tagService.addTag(data);
			this.addTagInput.reset();
			this.addTagImage = null;

			this.addTagDialog()?.nativeElement.close();
		}
	}

	private onDelete(id: number): void {
		this.tagService.deleteTag(id);
	}

	private onSelectedRow(): void {
		if (this.tagBlock()?.nativeElement && !this.isSelectedRow) {
			this.render.listen(this.tagBlock()!.nativeElement, "click", (e: Event) => {
				const t = e.target as HTMLElement;
				if (t.tagName.toLowerCase() === "td") {
					const r = t.closest("tr") as HTMLTableRowElement;
					if (r) {
						const radio = r.querySelector('input[type="radio"]') as HTMLInputElement;
						if (radio) {
							this.render.setProperty(radio, "checked", true);
						}

						const tagId: number = Number.parseInt(r.dataset["tagId"] as string);

						this.tags()!.forEach((tag: ITagEntity): void => {
							if (tag.id === tagId) {
								this.selectedTag = tag;
								return;
							}
						});

						if (this.selectedTag) {
							if (this.removeBtn()?.nativeElement) {
								this.render.listen(this.removeBtn()!.nativeElement, "click", () => {
									if (this.selectedTag?.id) {
										this.onDelete(this.selectedTag?.id);
										this.selectedTag = undefined;
										this.isSelectedRow = false;
										this.render.setProperty(this.tagBlock()!.nativeElement, "checked", false);
									}
								});
							}
						}
					}
				}
			});
		}
	}

	private showMessage(): void {
		effect(() => {
			if (this.messages() !== null) {
				this.toast.show(`${this.messages()}`, {
					theme: "snackbar",
					duration: 5000,
					autoClose: true,
					position: "bottom-center",
					dismissible: true,
					style: {
						"border-radius": "30px"
					}
				});
			}
		});
	}

	private showLoadingFailed(): void {
		effect(() => {
			if (this.tags() && this.tags().length === 0) {
				setTimeout(() => {
					this.loadingFailed.set(true);
				}, 30000);
			} else {
				this.loadingFailed.set(false);
			}
		});
	}

	openAddTagModal(): void {
		if (this.addTagDialog()?.nativeElement) {
			this.addTagDialog()?.nativeElement.showModal();
		}
	}

	closeAddTagModal(): void {
		if (this.addTagDialog()?.nativeElement && this.addTagDialog()?.nativeElement.open) {
			this.addTagDialog()!.nativeElement.close();
		}
	}
}
