export interface WorkerSummaryCardEmail {
    receiverEmail: string;
    ccReceiverEmail: string;
    ccoReceiverEmail: string;
    subject: string;
    body: string;
    workerData: WorkerDataFilter;
}

export interface WorkerDataFilter {
    listaIdsEmpresas?: any[],
    listaIdsCentros?: any[],
    listaIdsTipoDocumento?: any[],
    listaFiltroMetadatosDto?: {
        nombreMetadato?: string,
        listaIdsValoresDato?: any[],
        valorDato?: string
    }[]
}