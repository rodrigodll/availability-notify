import {
  testSetup,
  updateRetry,
  preserveCookie,
} from '../support/common/support'
import { testCase1 } from '../support/availability-notify.outputvalidation'
import { triggerBroadCaster } from '../support/broadcaster.api'
import { verifyEmail } from '../support/availability-notify'
import {
  updateProductStatus,
  configureTargetWorkspace,
  configureBroadcasterAdapter,
} from '../support/availability-notify.apis'
import availabilityNotifySelectors from '../support/availability-notify.selectors'
import availabilityNotifyConstants from '../support/availability-notify.constants'
import availbalityNotifyProducts from '../support/availability-notify.products'
import {
  graphql,
  validateDeleteRequestResponse,
  validateListRequestResponse,
  deleteRequest,
  listRequests,
} from '../support/availability.graphql'

const { data1, name, email } = testCase1
const workspace = Cypress.env().workspace.name

describe('Test availability notify scenarios', () => {
  // Load test setup
  testSetup()

  it('List Requests', () => {
    graphql(listRequests(), (response) => {
      validateListRequestResponse()
      cy.setavailabilitySubscribeId(response.body.data.listRequests)
    })
  })

  it('Delete Request', () => {
    cy.setDeleteId().then((deleteId) => {
      deleteId.forEach((r) => {
        graphql(deleteRequest(r.id), validateDeleteRequestResponse)
      })
    })
  })

  configureTargetWorkspace(true)
  updateProductStatus(data1, false)
  it('Open product', updateRetry(3), () => {
    cy.openStoreFront()
    cy.openProduct(availbalityNotifyProducts.Lenovo.name, true)
  })
  it('Enable marketplace to notify and validate', updateRetry(3), () => {
    cy.subscribeToProduct({ email, name })
    cy.get(availabilityNotifySelectors.AvailabilityNotifyAlert).should(
      'have.text',
      availabilityNotifyConstants.EmailRegistered
    )
  })
  configureBroadcasterAdapter(workspace)
  configureTargetWorkspace(false)
  updateProductStatus(data1, true)
  triggerBroadCaster(data1.skuId)
  verifyEmail()
  preserveCookie()
})
