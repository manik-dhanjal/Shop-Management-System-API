import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { GetDropdownOptionsDto } from './dto/get-dropdown-options.dto';
import { FormService } from './form.service';
import { PaginatedResponseDto } from '@shared/dto/pagination-response.dto';

@Controller({ path: '/shop/:shopId/form', version: '1' })
class FormController {
  constructor(private readonly formService: FormService) {}

  @Post('dropdown-options')
  getDropdownOptions(
    @Param('shopId') shopId: string,
    @Body() dto: GetDropdownOptionsDto,
  ): Promise<PaginatedResponseDto<{ value: any; label: string }>> {
    return this.formService.getDropdownOptions(shopId, dto);
  }
}

export default FormController;
