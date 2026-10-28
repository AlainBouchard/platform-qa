import {
  expect,
  type Locator,
  type Page,
  type Response,
} from '@playwright/test';
import { waitForPartInsertionProgress } from '../helpers/part-insertion-progress';

const controllerResults = /part-browser-CE-CL-/;
export const designPath = '/machine-builder/{designId}';

export const roleName = {
  search: 'Search for Parts...',
  startBuilding: 'Start building now',
  modelDownload: '3D Model',
  assemblyInstructions: 'Assembly instructions',
  deleteController: 'Delete Controller',
  controllers: 'Controllers',
  machineMotionAi: 'MachineMotion AI',
} as const;

export class MachineBuilderPage {
  constructor(private readonly page: Page) {}

  private get search() {
    return this.page.getByRole('textbox', {
      name: roleName.search,
    });
  }
  get billOfMaterialsTab() {
    return this.page.getByTestId('Bill of materials-NavigationTab');
  }
  get billOfMaterialsSection() {
    return this.page.getByTestId('bom-tab');
  }
  get modelDownload() {
    return this.billOfMaterialsSection.getByRole('button', {
      name: roleName.modelDownload,
    });
  }
  get assemblyInstructions() {
    return this.billOfMaterialsSection.getByRole('button', {
      name: roleName.assemblyInstructions,
    });
  }
  get configurationTab() {
    return this.page.getByTestId('Configuration-NavigationTab');
  }
  get configuration() {
    return this.page.getByTestId('config-tab');
  }
  get configurationDownloads() {
    return this.configuration.getByTestId('configDownloadButton');
  }
  get downloadConfigurationItems() {
    return this.configuration.getByTestId('mmai-controller-tree-item');
  }
  get downloadConfigurationAlerts() {
    return this.downloadConfigurationItems.getByTestId(
      'mmai-controller-tree-item-alertIcon',
    );
  }
  get configProperties() {
    return this.page.getByTestId('config-properties');
  }
  get deleteController() {
    return this.configProperties.getByRole('button', {
      name: roleName.deleteController,
    });
  }

  async open(designId: string): Promise<void> {
    const response = await this.page.goto(
      designPath.replaceAll('{designId}', designId),
    );
    if (!response?.ok()) {
      throw new Error(
        `Machine Builder did not open (${response?.status() ?? 'no response'}): ${this.page.url()}`,
      );
    }
    const cookies = this.page.locator('#CybotCookiebotDialog');
    if (await cookies.isVisible({ timeout: 8000 }).catch(() => false)) {
      await this.page.locator('#CybotCookiebotDialogBodyButtonDecline').click();
      await cookies.waitFor({ state: 'hidden' });
    }
    const start = this.page.getByRole('button', {
      name: roleName.startBuilding,
    });
    // The button stays disabled until Machine Builder finishes loading.
    await start.click({ timeout: 60_000 });
    await start.waitFor({ state: 'hidden' });
    await expect(this.search).toBeVisible();
  }

  async openBillOfMaterials(): Promise<void> {
    await this.billOfMaterialsTab.click();
  }

  async searchFor(query: string): Promise<void> {
    await this.search.click();
    await this.search.fill('');
    await this.search.fill(query);
    await expect(this.search).toHaveValue(query);
  }

  controllerResults() {
    return this.page.getByTestId(controllerResults);
  }

  async placeOnCanvas(partNumber: string, timeout?: number): Promise<Response> {
    const image = this.page
      .getByTestId(`part-browser-${partNumber}`)
      .getByRole('img');
    await this.scrollIntoPanel(image);
    await expect
      .poll(
        () =>
          image.evaluate(
            (node) =>
              node instanceof HTMLImageElement &&
              node.complete &&
              node.naturalWidth > 0 &&
              getComputedStyle(node).visibility === 'visible',
          ),
        { timeout: 20_000 },
      )
      .toBe(true);
    await expect(async () => {
      await this.dismissPartDetails(image);
      await this.scrollIntoPanel(image);
      const hittable = await image.evaluate((node) => {
        const rect = node.getBoundingClientRect();
        if (rect.width < 2 || rect.height < 2) return false;
        const hit = document.elementFromPoint(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2,
        );
        return hit === node || node.contains(hit);
      });
      if (!hittable) throw new Error('The part image is not clickable');
      await image.click({ timeout: 5_000 });
    }).toPass({ timeout: 30_000 });

    await waitForPartInsertionProgress(this.page, timeout);

    const priced = this.page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        response.url().includes('/price') &&
        (response.request().postData() ?? '').includes(partNumber),
      { timeout: 15_000 },
    );
    const viewer = this.page.locator('#viewerContainer');
    const box = await viewer.boundingBox();
    if (!box) throw new Error('The 3D canvas is not visible');
    await this.page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);

    const response = await priced;
    if (!response.ok()) {
      throw new Error(
        `The price request for ${partNumber} did not succeed: ${response.status()}`,
      );
    }
    return response;
  }

  bomPart(partNumber: string) {
    return this.page.getByTestId(`bom-${partNumber}`);
  }

  async openConfiguration(): Promise<void> {
    await this.configurationTab.click();
  }

  private async scrollIntoPanel(target: Locator): Promise<void> {
    await target.evaluate((node) => {
      let parent = node.parentElement;
      while (parent) {
        const overflowY = getComputedStyle(parent).overflowY;
        const scrolls =
          (overflowY === 'auto' ||
            overflowY === 'scroll' ||
            overflowY === 'overlay') &&
          parent.scrollHeight > parent.clientHeight + 1;
        if (scrolls) {
          const parentRect = parent.getBoundingClientRect();
          const nodeRect = node.getBoundingClientRect();
          parent.scrollTop +=
            nodeRect.top -
            parentRect.top -
            (parent.clientHeight - nodeRect.height) / 2;
          return;
        }
        parent = parent.parentElement;
      }
      node.scrollIntoView({ block: 'center', inline: 'nearest' });
    });
  }

  private async dismissPartDetails(image: Locator): Promise<void> {
    const covered = await image.evaluate((node) => {
      let current = node.parentElement;
      while (current && current !== document.body) {
        if (getComputedStyle(current).pointerEvents === 'none') return true;
        current = current.parentElement;
      }
      return false;
    });
    if (!covered) return;
    await this.page.getByRole('button', { name: '\uF00D' }).last().click();
  }
}
