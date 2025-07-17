export interface LotDetailResponseDto {
  id: string;
  name: string;
  area: number;
  lotPrice: number;
  urbanizationPrice: number;
  totalPrice: number;
  status: string;
  blockId: string;
  blockName: string;
  stageId: string;
  stageName: string;
  projectId: string;
  projectName: string;
  projectCurrency: string;
  createdAt: Date;
  updatedAt: Date;
}
