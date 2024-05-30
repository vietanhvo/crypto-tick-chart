import {
  BindingKeys,
  IBaseRestRequestService,
  container,
} from "@mt/next-infra";

const baseDataProviderService = container.resolve<IBaseRestRequestService>(
  BindingKeys.NEXT_DATA_PROVIDER,
);

export default baseDataProviderService;
