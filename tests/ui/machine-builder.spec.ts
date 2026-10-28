import { Part } from '../../api/machine-builder.api';
import { expect, test } from '../../fixtures/machine-builder.fixture';
import { asApiResponse } from '../../helpers/api-response';
import { roleName } from '../../pages/machine-builder.page';

test.describe.configure({ timeout: 180_000 });

test.describe('MachineMotion AI', () => {
  test('shows one MachineMotion AI in the bill of materials and configuration', async ({
    builder,
  }) => {
    await builder.openBillOfMaterials();
    await expect(builder.billOfMaterialsSection).toBeVisible();
    await expect(builder.modelDownload).toBeVisible();
    await expect(builder.assemblyInstructions).toBeVisible();

    await builder.searchFor(roleName.controllers);
    await expect(builder.controllerResults()).toHaveCount(4);

    const price = await builder.placeOnCanvas(
      Part.machineMotionAi.partNumber,
      5_000,
    );
    await expect(asApiResponse(price)).toBeOK();

    const part = builder.bomPart(Part.machineMotionAi.partNumber);
    await expect(part).toContainText(roleName.machineMotionAi);
    await expect(part.getByTestId('bom-quantity')).toHaveText('1');

    await builder.openConfiguration();
    await expect(builder.configuration).toBeVisible();
    await expect(builder.configuration).toContainText(roleName.machineMotionAi);
    await expect(builder.configurationDownloads).toHaveCount(1);
  });

  test('lists MachineMotion AI controllers in download configuration', async ({
    builder,
  }) => {
    await builder.openConfiguration();
    await expect(builder.downloadConfigurationItems).toHaveCount(0);

    await builder.searchFor(roleName.controllers);
    const first = await builder.placeOnCanvas(
      Part.machineMotionAi.partNumber,
      5_000,
    );
    await expect(asApiResponse(first)).toBeOK();
    await builder.openConfiguration();
    await expect(builder.downloadConfigurationItems).toHaveCount(1);

    await builder.searchFor(roleName.controllers);
    const second = await builder.placeOnCanvas(
      Part.machineMotionAi.partNumber,
      5_000,
    );
    await expect(asApiResponse(second)).toBeOK();
    await builder.openConfiguration();
    await expect(builder.downloadConfigurationItems).toHaveCount(2);
    await expect(builder.downloadConfigurationAlerts).toHaveCount(2);

    await builder.downloadConfigurationItems.last().click();
    await expect(builder.configProperties).toBeVisible();
    await expect(builder.deleteController).toBeVisible();
    await builder.deleteController.click();
    await expect(builder.downloadConfigurationItems).toHaveCount(1);
    await expect(builder.downloadConfigurationAlerts).toHaveCount(0);
    await expect(builder.deleteController).toBeHidden();
  });
});
