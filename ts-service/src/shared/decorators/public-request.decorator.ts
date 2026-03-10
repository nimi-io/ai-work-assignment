import { SetMetadata, CustomDecorator } from '@nestjs/common';
import { IS_PUBLIC_KEY } from 'src/shared/constants/index.constant';

export const IsPublic = (): CustomDecorator => SetMetadata(IS_PUBLIC_KEY, true);
