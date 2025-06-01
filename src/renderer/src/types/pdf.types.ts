export type PDFOutline = {
   title: string;
   bold: boolean;
   italic: boolean;
   color: Uint8ClampedArray;
   dest: string | Array<any> | null;
   url: string | null;
   unsafeUrl: string | undefined;
   newWindow: boolean | undefined;
   count: number | undefined;
   items: PDFOutline[];
   resolvedPageNumber?: number;
   resolvedEndPageNumber?: number;
};

export type PDFPageDimension = {
   width: number;
   height: number;
};

export type PDFPageScaleType = "fit-width" | "fit-height" | "percentage";

export type PDFPageScale = {
   scaleType: PDFPageScaleType;
   scalePercentage: number;
};

export type PDFPageLayout = "single-page" | "double-page" | "cover-facing-page";

export type PDFPageTransition = "continuous-page" | "page-by-page";
