import { Component, OnInit, Input, Output, ViewChild, ElementRef, OnDestroy, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-infinite-scroll',
    templateUrl: './infinite-scroll.component.html',
    styleUrls: ['./infinite-scroll.component.scss']
})
export class InfiniteScrollComponent implements OnInit, OnDestroy {

    @Input() options = {};
    @Output() scrolled = new EventEmitter();
    @ViewChild('anchor') anchor: ElementRef<HTMLElement>;

    private observer: IntersectionObserver;

    constructor(private host: ElementRef) { }

    get element() {
        return this.host.nativeElement;
    }

    ngOnInit(): void {
        const options = {
            root: null,
            ...this.options
        };

        this.observer = new IntersectionObserver(([entry]) => {
            entry.isIntersecting && this.scrolled.emit('void');
        }, options);

        this.observer.observe(this.anchor.nativeElement);
    }

    ngOnDestroy() {
        this.observer.disconnect();
    }

    private isHostScrollable(): boolean {
        const style = window.getComputedStyle(this.element);

        return style.getPropertyValue('overflow') === 'auto' ||
            style.getPropertyValue('overflow-y') === 'scroll';
    }

}
